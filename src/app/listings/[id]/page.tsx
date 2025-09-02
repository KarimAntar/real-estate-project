"use client";

import { useParams } from "next/navigation";
import { listings } from "@/data/listings";
import Slider from "react-slick";
import Image from "next/image";
import { FaBed, FaBath, FaRulerCombined } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PropertyDetails() {
  const params = useParams();
  const id =
    params && typeof params.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id[0]
      : undefined;

  const property = listings.find((item) => item.id === Number(id));
  const mainSlider = useRef<Slider>(null);
  const thumbSlider = useRef<Slider>(null);

const [nav1, setNav1] = useState<Slider | undefined>(undefined);
const [nav2, setNav2] = useState<Slider | undefined>(undefined);

  // Initialize slider refs after mount
  useEffect(() => {
    if (mainSlider.current) setNav1(mainSlider.current);
    if (thumbSlider.current) setNav2(thumbSlider.current);
  }, []);

  if (!property) return <div>Property not found</div>;

  const mainSettings = {
    asNavFor: nav2,
    ref: mainSlider,
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  const thumbSettings = {
    asNavFor: nav1,
    ref: thumbSlider,
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: Math.min(property.images.length, 5),
    swipeToSlide: true,
    focusOnSelect: true, // ensures clicking thumbnail updates main slider
    centerMode: true,
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Main Slider */}
      <Slider
        {...mainSettings}
        className="mb-4 cursor-grab active:cursor-grabbing select-none"
      >
        {property.images.map((img, idx) => (
          <div key={idx} className="relative w-full h-[500px] select-none">
            <Image
              src={img}
              alt={property.title}
              fill
              className="object-contain rounded-xl select-none pointer-events-none"
              priority={idx === 0}
            />
          </div>
        ))}
      </Slider>

      {/* Thumbnail Slider */}
      <Slider {...thumbSettings} className="mb-6">
        {property.images.map((img, idx) => (
          <div key={idx} className="px-2 select-none">
            <div className="relative w-full h-24">
              <Image
                src={img}
                alt={`Thumbnail ${idx}`}
                fill
                className="object-cover rounded-lg cursor-pointer select-none"
              />
            </div>
          </div>
        ))}
      </Slider>

      {/* Info */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <p className="text-lg text-gray-600">{property.location}</p>
        <p className="text-2xl font-semibold text-blue-600 mt-2">
          {property.price}
        </p>

        <div className="grid grid-cols-3 gap-6 mt-6 text-center">
          <div className="p-4 border rounded-xl shadow-sm hover:shadow-md transition">
            <FaBed className="mx-auto text-blue-500" size={28} />
            <p className="text-2xl font-bold">{property.bedrooms}</p>
            <p className="text-gray-600">Bedrooms</p>
          </div>
          <div className="p-4 border rounded-xl shadow-sm hover:shadow-md transition">
            <FaBath className="mx-auto text-blue-500" size={28} />
            <p className="text-2xl font-bold">{property.bathrooms}</p>
            <p className="text-gray-600">Bathrooms</p>
          </div>
          <div className="p-4 border rounded-xl shadow-sm hover:shadow-md transition">
            <FaRulerCombined className="mx-auto text-blue-500" size={28} />
            <p className="text-2xl font-bold">{property.area}</p>
            <p className="text-gray-600">sqft</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-10 bg-gray-50 border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Property Description
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {property.description}
          </p>
        </div>
      </div>
    </div>
  );
}
