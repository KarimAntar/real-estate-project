"use client";

import { useState } from "react";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaPaperPlane,
  FaQuestionCircle,
  FaHeadset,
  FaHome
} from "react-icons/fa";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: FaPhone,
      title: "Call Us",
      details: ["+1 (555) 123-4567", "+1 (555) 765-4321"],
      description: "Mon-Fri 9AM-6PM, Sat 10AM-4PM",
      color: "text-blue-400"
    },
    {
      icon: FaEnvelope,
      title: "Email Us",
      details: ["info@realestate.com", "support@realestate.com"],
      description: "We'll respond within 24 hours",
      color: "text-green-400"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Visit Us",
      details: ["123 Real Estate Ave", "Suite 100, City, State 12345"],
      description: "Open Monday to Friday",
      color: "text-purple-400"
    },
    {
      icon: FaClock,
      title: "Business Hours",
      details: ["Mon-Fri: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM"],
      description: "Closed Sundays & Holidays",
      color: "text-yellow-400"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Inquiry" },
    { value: "buying", label: "Buying Property" },
    { value: "selling", label: "Selling Property" },
    { value: "renting", label: "Renting Property" },
    { value: "support", label: "Technical Support" },
    { value: "partnership", label: "Partnership" }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: "#", color: "hover:text-blue-500" },
    { icon: FaTwitter, href: "#", color: "hover:text-sky-400" },
    { icon: FaInstagram, href: "#", color: "hover:text-pink-400" },
    { icon: FaLinkedin, href: "#", color: "hover:text-blue-600" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get In <span className="text-blue-400">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have questions about our properties or services? We're here to help! 
            Reach out to our expert team and let's find your perfect home together.
          </p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-all duration-300 hover:scale-105 group">
                <div className={`${info.color} text-3xl mb-4 group-hover:scale-110 transition-transform mx-auto w-fit`}>
                  <info.icon />
                </div>
                <h3 className="text-xl font-semibold mb-3">{info.title}</h3>
                <div className="space-y-1 mb-3">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-300">{detail}</p>
                  ))}
                </div>
                <p className="text-sm text-gray-400">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gray-900 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaPaperPlane className="text-blue-400 text-2xl" />
                <h2 className="text-3xl font-bold">Send us a Message</h2>
              </div>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-green-400 text-6xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-2 text-green-400">Message Sent!</h3>
                  <p className="text-gray-300">Thank you for contacting us. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="inquiryType" className="block text-sm font-medium mb-2">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={form.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        placeholder="Brief subject"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* FAQ Section */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FaQuestionCircle className="text-blue-400 text-2xl" />
                  <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-gray-700 pb-4">
                    <h4 className="font-semibold mb-2">How do I schedule a property viewing?</h4>
                    <p className="text-gray-300 text-sm">You can schedule viewings directly through our platform or contact us using the information above.</p>
                  </div>
                  <div className="border-b border-gray-700 pb-4">
                    <h4 className="font-semibold mb-2">What documents do I need to rent/buy?</h4>
                    <p className="text-gray-300 text-sm">Required documents vary by property type. Our agents will provide you with a complete checklist.</p>
                  </div>
                  <div className="pb-4">
                    <h4 className="font-semibold mb-2">Do you charge fees for buyers?</h4>
                    <p className="text-gray-300 text-sm">We offer transparent pricing with no hidden fees. Contact us for detailed information about our services.</p>
                  </div>
                </div>
              </div>

              {/* Support Options */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FaHeadset className="text-green-400 text-2xl" />
                  <h3 className="text-2xl font-bold">Need Immediate Help?</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                    <FaPhone className="text-blue-400 text-xl" />
                    <div>
                      <h4 className="font-semibold">Emergency Hotline</h4>
                      <p className="text-gray-300 text-sm">Available 24/7 for urgent matters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                    <FaEnvelope className="text-green-400 text-xl" />
                    <div>
                      <h4 className="font-semibold">Live Chat Support</h4>
                      <p className="text-gray-300 text-sm">Get instant answers to your questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                    <FaHome className="text-purple-400 text-xl" />
                    <div>
                      <h4 className="font-semibold">Property Consultation</h4>
                      <p className="text-gray-300 text-sm">Book a free consultation with our experts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gray-900 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Follow Us</h3>
                <p className="text-gray-300 mb-6">
                  Stay connected and get the latest updates on new properties and market trends.
                </p>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className={`bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition-all duration-300 hover:scale-110 ${social.color}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <social.icon className="text-xl" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Visit Our <span className="text-blue-400">Office</span>
            </h2>
            <p className="text-xl text-gray-300">
              Located in the heart of the city, easily accessible by public transport
            </p>
          </div>

          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Map Placeholder */}
              <div className="relative h-64 lg:h-96 bg-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-4xl text-blue-400 mb-2 mx-auto" />
                  <p className="text-gray-300">Interactive Map</p>
                  <p className="text-sm text-gray-400">123 Real Estate Ave, Suite 100</p>
                </div>
              </div>
              
              {/* Location Details */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">Our Location</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-blue-400 text-xl mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-gray-300">123 Real Estate Avenue</p>
                      <p className="text-gray-300">Suite 100, City, State 12345</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FaClock className="text-green-400 text-xl mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Office Hours</h4>
                      <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-300">Saturday: 10:00 AM - 4:00 PM</p>
                      <p className="text-gray-300">Sunday: Closed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-purple-400 text-xl mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-gray-300">Main: +1 (555) 123-4567</p>
                      <p className="text-gray-300">Emergency: +1 (555) 765-4321</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
                    <h4 className="font-semibold mb-2 text-blue-400">Transportation</h4>
                    <p className="text-gray-300 text-sm">
                      • 2 minutes walk from Central Metro Station<br/>
                      • Free parking available for visitors<br/>
                      • Wheelchair accessible entrance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600/10 to-purple-600/10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your <span className="text-blue-400">Property Journey?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Don't wait any longer. Contact us today and let's find your perfect home together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15551234567"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaPhone />
              Call Now
            </a>
            <a
              href="mailto:info@realestate.com"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaEnvelope />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}