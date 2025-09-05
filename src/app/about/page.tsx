"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  FaHome, 
  FaUsers, 
  FaHandshake, 
  FaAward, 
  FaChartLine, 
  FaHeart,
  FaShieldAlt,
  FaClock,
  FaGlobe,
  FaArrowRight
} from "react-icons/fa";

export default function AboutPage() {
  const stats = [
    { icon: FaHome, number: "500+", label: "Properties Sold", color: "text-blue-400" },
    { icon: FaUsers, number: "1,200+", label: "Happy Customers", color: "text-green-400" },
    { icon: FaHandshake, number: "50+", label: "Verified Agents", color: "text-purple-400" },
    { icon: FaAward, number: "5", label: "Years Experience", color: "text-yellow-400" },
  ];

  const values = [
    {
      icon: FaShieldAlt,
      title: "Trust & Transparency",
      description: "We believe in honest communication and transparent processes. Every transaction is handled with integrity and clear documentation.",
      color: "text-blue-400"
    },
    {
      icon: FaHeart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We go above and beyond to ensure you find the perfect property that meets your needs.",
      color: "text-red-400"
    },
    {
      icon: FaClock,
      title: "24/7 Support",
      description: "Our dedicated team is available around the clock to assist you with any questions or concerns throughout your property journey.",
      color: "text-green-400"
    },
    {
      icon: FaGlobe,
      title: "Local Expertise",
      description: "With deep knowledge of local markets, we provide insights that help you make informed decisions about your property investments.",
      color: "text-purple-400"
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b05b?auto=format&fit=crop&w=400&q=80",
      description: "15+ years in real estate with a passion for helping families find their dream homes."
    },
    {
      name: "Michael Chen",
      role: "Head of Sales",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      description: "Expert negotiator with a track record of closing complex real estate deals."
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Success Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
      description: "Dedicated to ensuring every client has an exceptional experience from start to finish."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-blue-400">Our Story</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're not just a real estate platform – we're your trusted partners in finding the perfect home. 
            Our mission is to make property discovery and transactions seamless, transparent, and rewarding.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                  <stat.icon className={`mx-auto text-4xl mb-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="text-3xl font-bold mb-2">{stat.number}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Our <span className="text-blue-400">Journey</span>
              </h2>
              <div className="space-y-6 text-gray-300">
                <p className="text-lg leading-relaxed">
                  Founded in 2019, our real estate platform was born from a simple idea: make property hunting 
                  easier, more transparent, and more enjoyable for everyone involved.
                </p>
                <p className="text-lg leading-relaxed">
                  We started as a small team of real estate enthusiasts who were frustrated with the 
                  traditional property search process. Too many platforms were cluttered, outdated, 
                  and didn't prioritize user experience.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we've grown into a trusted platform that connects thousands of buyers, sellers, 
                  and renters with their perfect properties. Our technology-driven approach combined with 
                  personal touch has revolutionized how people discover and secure their dream homes.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[500px] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
                  alt="Our team working together"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-xl">
                <FaChartLine className="text-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-800 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Our <span className="text-blue-400">Core Values</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These principles guide every decision we make and every service we provide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-900 rounded-2xl p-8 hover:bg-gray-700 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className={`${value.color} text-3xl group-hover:scale-110 transition-transform`}>
                    <value.icon />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Meet Our <span className="text-blue-400">Expert Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Passionate professionals dedicated to making your real estate journey exceptional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-700 transition-all duration-300 group">
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-blue-400 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600/10 to-purple-600/10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Our <span className="text-blue-400">Mission</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            "To empower every individual and family to find their perfect home through innovative technology, 
            exceptional service, and unwavering commitment to their success. We believe that everyone deserves 
            a place they can truly call home."
          </p>
          <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-4">Why Choose Us?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Verified Listings</h4>
                  <p className="text-gray-300 text-sm">Every property is thoroughly verified for accuracy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Expert Guidance</h4>
                  <p className="text-gray-300 text-sm">Professional support throughout your journey</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Modern Platform</h4>
                  <p className="text-gray-300 text-sm">Cutting-edge technology for seamless experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-green-400 text-xl mt-1">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Transparent Process</h4>
                  <p className="text-gray-300 text-sm">Clear communication and honest pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find Your <span className="text-blue-400">Dream Home?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers who found their perfect property with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
            >
              Browse Properties
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}