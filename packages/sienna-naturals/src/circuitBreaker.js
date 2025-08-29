import { EventEmitter } from 'events';
import winston from 'winston';

export class CircuitBreaker extends EventEmitter {
  constructor(fn, options = {}) {
    super();
    
    this.fn = fn;
    this.name = options.name || 'CircuitBreaker';
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 60 seconds
    this.monitorTimeout = options.monitorTimeout || 10000; // 10 seconds
    
    // Circuit breaker states
    this.state = 'closed'; // closed, open, half-open
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      openCount: 0,
      halfOpenCount: 0
    };
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });
    
    // Setup monitoring
    this.monitorInterval = setInterval(() => {
      this.checkState();
    }, this.monitorTimeout);
  }

  async call(...args) {
    this.stats.totalRequests++;

    // Check if circuit breaker allows the call
    if (!this.isCallAllowed()) {
      const error = new Error(`Circuit breaker is OPEN for ${this.name}`);
      error.name = 'CircuitBreakerOpenError';
      error.circuitBreakerName = this.name;
      error.state = this.state;
      throw error;
    }

    // If we're in half-open state, we're testing if the service has recovered
    const wasHalfOpen = this.state === 'half-open';

    try {
      const startTime = Date.now();
      const result = await this.fn(...args);
      const responseTime = Date.now() - startTime;

      // Call succeeded
      this.onSuccess(responseTime, wasHalfOpen);
      return result;

    } catch (error) {
      // Call failed
      this.onFailure(error, wasHalfOpen);
      throw error;
    }
  }

  isCallAllowed() {
    switch (this.state) {
      case 'closed':
        return true;
      case 'open':
        // Check if enough time has passed to try again
        if (this.shouldAttemptReset()) {
          this.moveToHalfOpen();
          return true;
        }
        return false;
      case 'half-open':
        return true;
      default:
        return false;
    }
  }

  onSuccess(responseTime, wasHalfOpen) {
    this.stats.successfulRequests++;
    
    if (this.state === 'half-open') {
      // Service has recovered, close the circuit
      this.moveToClosed();
      this.logger.info(`Circuit breaker ${this.name} closed after successful test call`, {
        responseTime,
        failureCount: this.failureCount
      });
    }
    
    // Reset failure count on success
    this.failureCount = 0;
    this.lastFailureTime = null;
    
    this.emit('success', {
      name: this.name,
      responseTime,
      state: this.state,
      wasHalfOpen
    });
  }

  onFailure(error, wasHalfOpen) {
    this.stats.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    this.logger.warn(`Circuit breaker ${this.name} recorded failure`, {
      error: error.message,
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
      state: this.state
    });

    if (this.state === 'half-open') {
      // Service is still failing, go back to open
      this.moveToOpen();
    } else if (this.failureCount >= this.failureThreshold) {
      // Threshold reached, open the circuit
      this.moveToOpen();
    }

    this.emit('failure', {
      name: this.name,
      error,
      failureCount: this.failureCount,
      state: this.state,
      wasHalfOpen
    });
  }

  moveToOpen() {
    const previousState = this.state;
    this.state = 'open';
    this.stats.openCount++;
    this.nextAttemptTime = Date.now() + this.resetTimeout;

    this.logger.warn(`Circuit breaker ${this.name} opened`, {
      previousState,
      failureCount: this.failureCount,
      nextAttemptTime: new Date(this.nextAttemptTime).toISOString()
    });

    this.emit('open', {
      name: this.name,
      previousState,
      failureCount: this.failureCount,
      nextAttemptTime: this.nextAttemptTime
    });
  }

  moveToHalfOpen() {
    const previousState = this.state;
    this.state = 'half-open';
    this.stats.halfOpenCount++;

    this.logger.info(`Circuit breaker ${this.name} moved to half-open`, {
      previousState,
      timeSinceOpen: this.lastFailureTime ? Date.now() - this.lastFailureTime : 0
    });

    this.emit('half-open', {
      name: this.name,
      previousState,
      timeSinceLastFailure: this.lastFailureTime ? Date.now() - this.lastFailureTime : 0
    });
  }

  moveToClosed() {
    const previousState = this.state;
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;

    this.logger.info(`Circuit breaker ${this.name} closed`, {
      previousState
    });

    this.emit('closed', {
      name: this.name,
      previousState
    });
  }

  shouldAttemptReset() {
    return this.state === 'open' && 
           this.nextAttemptTime && 
           Date.now() >= this.nextAttemptTime;
  }

  checkState() {
    if (this.state === 'open' && this.shouldAttemptReset()) {
      this.moveToHalfOpen();
    }
  }

  // Manual control methods
  reset() {
    const previousState = this.state;
    this.moveToClosed();
    
    this.logger.info(`Circuit breaker ${this.name} manually reset`, {
      previousState,
      failureCount: this.failureCount
    });

    this.emit('reset', {
      name: this.name,
      previousState
    });
  }

  forceOpen() {
    const previousState = this.state;
    this.moveToOpen();
    
    this.logger.warn(`Circuit breaker ${this.name} manually opened`, {
      previousState
    });

    this.emit('forceOpen', {
      name: this.name,
      previousState
    });
  }

  // Getters for status information
  getState() {
    return this.state;
  }

  getFailureCount() {
    return this.failureCount;
  }

  getLastFailureTime() {
    return this.lastFailureTime;
  }

  getNextAttemptTime() {
    return this.nextAttemptTime;
  }

  getStats() {
    const now = Date.now();
    const uptime = now - (this.stats.startTime || now);
    
    return {
      ...this.stats,
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      uptime,
      successRate: this.stats.totalRequests > 0 ? 
        (this.stats.successfulRequests / this.stats.totalRequests) * 100 : 0,
      failureRate: this.stats.totalRequests > 0 ? 
        (this.stats.failedRequests / this.stats.totalRequests) * 100 : 0
    };
  }

  // Health check method
  getHealthStatus() {
    const stats = this.getStats();
    const now = Date.now();
    
    let healthStatus = 'healthy';
    if (this.state === 'open') {
      healthStatus = 'unhealthy';
    } else if (this.state === 'half-open') {
      healthStatus = 'recovering';
    } else if (stats.failureRate > 10) {
      healthStatus = 'degraded';
    }

    return {
      name: this.name,
      status: healthStatus,
      state: this.state,
      isCallAllowed: this.isCallAllowed(),
      stats,
      lastCheck: new Date(now).toISOString()
    };
  }

  // Configuration methods
  updateConfig(newConfig) {
    if (newConfig.failureThreshold !== undefined) {
      this.failureThreshold = newConfig.failureThreshold;
    }
    if (newConfig.resetTimeout !== undefined) {
      this.resetTimeout = newConfig.resetTimeout;
    }
    if (newConfig.monitorTimeout !== undefined) {
      this.monitorTimeout = newConfig.monitorTimeout;
      
      // Restart monitor with new timeout
      if (this.monitorInterval) {
        clearInterval(this.monitorInterval);
      }
      this.monitorInterval = setInterval(() => {
        this.checkState();
      }, this.monitorTimeout);
    }

    this.logger.info(`Circuit breaker ${this.name} configuration updated`, newConfig);
  }

  // Cleanup method
  destroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.removeAllListeners();
    
    this.logger.info(`Circuit breaker ${this.name} destroyed`);
  }
}

// Circuit Breaker Manager for handling multiple circuit breakers
export class CircuitBreakerManager {
  constructor() {
    this.circuitBreakers = new Map();
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console()]
    });
  }

  create(name, fn, options = {}) {
    if (this.circuitBreakers.has(name)) {
      throw new Error(`Circuit breaker ${name} already exists`);
    }

    const cb = new CircuitBreaker(fn, { ...options, name });
    this.circuitBreakers.set(name, cb);

    // Forward events
    cb.on('open', (data) => this.logger.warn('Circuit breaker opened', data));
    cb.on('closed', (data) => this.logger.info('Circuit breaker closed', data));
    cb.on('half-open', (data) => this.logger.info('Circuit breaker half-open', data));

    return cb;
  }

  get(name) {
    return this.circuitBreakers.get(name);
  }

  getAll() {
    return Array.from(this.circuitBreakers.values());
  }

  getAllStatus() {
    const status = {};
    this.circuitBreakers.forEach((cb, name) => {
      status[name] = cb.getHealthStatus();
    });
    return status;
  }

  resetAll() {
    this.circuitBreakers.forEach((cb) => {
      cb.reset();
    });
    this.logger.info('All circuit breakers reset');
  }

  destroy(name) {
    const cb = this.circuitBreakers.get(name);
    if (cb) {
      cb.destroy();
      this.circuitBreakers.delete(name);
      this.logger.info(`Circuit breaker ${name} destroyed`);
    }
  }

  destroyAll() {
    this.circuitBreakers.forEach((cb) => {
      cb.destroy();
    });
    this.circuitBreakers.clear();
    this.logger.info('All circuit breakers destroyed');
  }
}