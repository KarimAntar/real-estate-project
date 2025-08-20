export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-center">Contact Us</h2>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Your Message"
          rows={4}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
