"use client";
import Slider from "react-slick";
import { Icon } from "@iconify/react/dist/iconify.js";

const ImagesPreviewCarousel = ({ imageUrls }) => {
    const settings = {
        dots: false,
        arrows: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
    };

    return (
        <div>
            <div className="card p-0 overflow-hidden position-relative radius-12">
                <div className="card-header py-16 px-24 bg-base border border-end-0 border-start-0 border-top-0">
                    <h6 className="text-lg mb-0">Image Urls Preview</h6>
                </div>
                <div className="card-body p-0 arrow-carousel">
                    <Slider {...settings}>
                        {imageUrls.map((item, index) => (
                            <div key={index} className="gradient-overlay bottom-0 start-0 h-100">
                                <img
                                    src={item.url || "assets/images/carousel/carousel-img2.png"}
                                    alt={item.caption}
                                    className="w-100 h-100 object-fit-cover"
                                />
                                <div className="position-absolute start-50 translate-middle-x bottom-0 pb-24 z-1 text-center w-100 max-w-440-px">
                                    <h5 className="card-title text-white text-lg mb-6">
                                        {item.caption || "No Caption"}
                                    </h5>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

const SampleNextArrow = ({ className, onClick }) => (
    <button
        onClick={onClick}
        type="button"
        className={`${className} slick-next slick-arrow`}
    >
        <Icon icon="ic:outline-keyboard-arrow-right" className="menu-icon" />
    </button>
);

const SamplePrevArrow = ({ className, onClick }) => (
    <button
        onClick={onClick}
        type="button"
        className={`${className} slick-prev slick-arrow`}
    >
        <Icon icon="ic:outline-keyboard-arrow-left" className="menu-icon" />
    </button>
);

export default ImagesPreviewCarousel;