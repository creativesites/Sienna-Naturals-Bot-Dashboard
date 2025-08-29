"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePathname } from "next/navigation";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { CopilotKit } from "@copilotkit/react-core";

const MasterLayout = ({ children }) => {
  let pathname = usePathname();
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = usePathname(); // Hook to get the current route

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location ||
            link.getAttribute("to") === location
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <CopilotKit publicApiKey="ck_pub_41f59aaa5376367e83571107f6f3af80">
      <section className={`sienna-main-layout ${mobileMenu ? "overlay active" : "overlay"}`}>
        {/* Premium Sidebar */}
      <aside
        className={`sienna-sidebar ${
          sidebarActive
            ? "sidebar active"
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }`}
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div className="sienna-sidebar-brand">
          <Link href='/' className='sidebar-logo'>
            <img
              src='/assets/images/sienna-logo.svg'
              alt='Sienna Naturals'
              className='light-logo'
              style={{filter: 'none'}}
            />
            <img
              src='/assets/images/sienna-logo.svg'
              alt='Sienna Naturals'
              className='dark-logo'
              style={{filter: 'none'}}
            />
            <img
              src='/assets/images/sienna-logo.svg'
              alt='Sienna Naturals'
              className='logo-icon'
              style={{filter: 'none'}}
            />
          </Link>
        </div>
        <div className='sienna-sidebar-nav'>
          <ul className='sidebar-menu' id='sidebar-menu'>
            <li className={`sienna-nav-item ${pathname === "/" ? "active" : ""}`}>
              <Link href='/' className={`sienna-nav-link ${pathname === "/" ? "active" : ""}`}>
                <Icon
                  icon='solar:home-smile-angle-outline'
                  className='sienna-nav-icon'
                />
                <span>Dashboard</span>
              </Link>
            </li>

            <li className='sidebar-menu-group-title' style={{color: 'var(--sienna-ash)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2rem 0 1rem 0'}}>Applications</li>
            
            <li className={`sienna-nav-item ${pathname === "/chat-message" ? "active" : ""}`}>
              <Link
                href='/chat-message'
                className={`sienna-nav-link ${pathname === "/chat-message" ? "active" : ""}`}
              >
                <Icon icon='bi:chat-dots' className='sienna-nav-icon' />
                <span>Conversations</span>
              </Link>
            </li>
           

            {/* Users */}
            <li className={`sienna-nav-item ${pathname === "/users" ? "active" : ""}`}>
              <Link href='/users' className={`sienna-nav-link ${pathname === "/users" ? "active" : ""}`}>
                <Icon
                  icon='flowbite:users-group-outline'
                  className='sienna-nav-icon'
                />
                <span>Users</span>
              </Link>
            </li>

            
          
            <li className={`sienna-nav-item ${pathname === "/documentation" ? "active" : ""}`}>
              <Link
                href='/documentation'
                className={`sienna-nav-link ${pathname === "/documentation" ? "active" : ""}`}
              >
                <Icon
                  icon='mage:message-question-mark-round'
                  className='sienna-nav-icon'
                />
                <span>Documentation</span>
              </Link>
            </li>
           
            <li className='sidebar-menu-group-title' style={{color: 'var(--sienna-ash)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '2rem 0 1rem 0'}}>Manage Chatbot</li>
            <li className={`sienna-nav-item ${pathname === "/instructions" ? "active" : ""}`}>
              <Link
                href='/instructions'
                className={`sienna-nav-link ${pathname === "/instructions" ? "active" : ""}`}
              >
                <Icon icon='octicon:info-24' className='sienna-nav-icon' />
                <span>Chatbot Instructions</span>
              </Link>
            </li>
            <li className={`sienna-nav-item ${pathname === "/products" ? "active" : ""}`}>
               <Link href='/products' className={`sienna-nav-link ${pathname === "/products" ? "active" : ""}`}>
               <Icon icon='mingcute:storage-line' className='sienna-nav-icon' />
               <span>Manage Products</span>
             </Link>
            </li>
            <li className={`sienna-nav-item ${pathname === "/training" ? "active" : ""}`}>
              <Link
                href='/training'
                className={`sienna-nav-link ${pathname === "/training" ? "active" : ""}`}
              >
                <Icon
                  icon='solar:document-text-outline'
                  className='sienna-nav-icon'
                />
                <span>Chatbot Training</span>
              </Link>
            </li>
              <li className={`sienna-nav-item ${pathname === "/testimonials" ? "active" : ""}`}>
                <Link
                  href='/testimonials'
                  className={`sienna-nav-link ${pathname === "/testimonials" ? "active" : ""}`}
                >
                  <Icon icon='ri-star-line' className='sienna-nav-icon' />
                  <span>Manage Testimonials</span>
                </Link>
              </li>
            
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='sienna-header'>
          <div className='sienna-header-content'>
            <div className='d-flex flex-wrap align-items-center gap-4'>
              <button
                type='button'
                className='sidebar-toggle sienna-btn sienna-btn-secondary sienna-btn-sm'
                onClick={sidebarControl}
              >
                {sidebarActive ? (
                  <Icon
                    icon='iconoir:arrow-right'
                    className='icon text-lg'
                  />
                ) : (
                  <Icon
                    icon='heroicons:bars-3-solid'
                    className='icon text-lg'
                  />
                )}
              </button>
              <button
                onClick={mobileMenuControl}
                type='button'
                className='sidebar-mobile-toggle sienna-btn sienna-btn-secondary sienna-btn-sm'
              >
                <Icon icon='heroicons:bars-3-solid' className='icon' />
              </button>
              <div className='sienna-search-field'>
                <input 
                  type='text' 
                  name='search' 
                  placeholder='Search dashboard...' 
                  className='sienna-search-input'
                />
                <Icon icon='solar:magnifer-bold-duotone' className='sienna-search-icon' />
              </div>
            </div>
            <div className='d-flex flex-wrap align-items-center gap-3'>
               

                <SignedIn>
                  <div className="premium-user-profile">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: {
                            width: '40px',
                            height: '40px',
                          }
                        }
                      }}
                    />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton className="sienna-btn sienna-btn-primary" />
                </SignedOut>
              </div>
            </div>
          </div>

        {/* Premium Main Content */}
        <div className='sienna-main-content sienna-animate-fadeIn'>{children}</div>

        {/* Footer section */}
        <footer className='d-footer'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <p className='mb-0'>© 2025 Sienna Naturals. All Rights Reserved.</p>
            </div>
            <div className='col-auto'>
              <p className='mb-0'>
                Made by <span className='text-primary-600'>Myavana</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
    </CopilotKit>
  );
};

export default MasterLayout;
