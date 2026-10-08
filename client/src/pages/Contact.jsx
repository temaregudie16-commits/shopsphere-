import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      return;
    }

    try {
      setSending(true);

      // Demo submit
      await new Promise((resolve) => setTimeout(resolve, 900));

      setSent(true);

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("CONTACT FORM ERROR:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-overlay" />

        <div className="contact-hero-content">
          <p className="contact-kicker">SHOPSPHERE SUPPORT</p>

          <h1>Find Us & Contact Us</h1>

          <p>We're here to help with your shopping experience.</p>
        </div>
      </section>

      {/* MAIN CONTACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MAP */}
          <div className="contact-card overflow-hidden">
            <div className="contact-card-header">
              <div>
                <p className="contact-small-title">OUR LOCATION</p>

                <h2>Find ShopSphere</h2>
              </div>

              <div className="contact-icon bg-blue-100 text-blue-700">📍</div>
            </div>

            <div className="contact-map">
              <iframe
                title="ShopSphere Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15654.75704152733!2d37.37526955!3d11.5976587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164627b001a1d13f%3A0x6b7b1b1b1b1b1b1b!2sBahir%20Dar%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1719293147570!5m2!1sen!2set"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-6">
              <p className="text-slate-500 text-sm">
                ShopSphere service location
              </p>

              <p className="font-black text-lg mt-1">
                Injibara, Amhara, Ethiopia
              </p>
            </div>
          </div>

          {/* GET IN TOUCH */}
          <div className="contact-card p-7 md:p-8">
            <div className="contact-card-header">
              <div>
                <p className="contact-small-title">GET IN TOUCH</p>

                <h2>Contact Us</h2>
              </div>

              <div className="contact-icon bg-emerald-100 text-emerald-700">
                💬
              </div>
            </div>

            <div className="space-y-4 mt-7">
              {/* ADDRESS */}
              <div className="contact-info-box">
                <div className="contact-info-icon bg-blue-100">📍</div>

                <div>
                  <p className="contact-info-label">Address</p>

                  <p className="contact-info-value">
                    Injibara, Amhara, Ethiopia
                  </p>
                </div>
              </div>

              {/* PHONE */}
              <a
                href="tel:+251919468741"
                className="contact-info-box hover:border-emerald-300"
              >
                <div className="contact-info-icon bg-emerald-100">📞</div>

                <div>
                  <p className="contact-info-label">Phone</p>

                  <p className="contact-info-value">+251 919 468 741</p>
                </div>
              </a>

              {/* EMAIL */}
              <a
                href="mailto:temaregudie@16gmail.com"
                className="contact-info-box hover:border-purple-300"
              >
                <div className="contact-info-icon bg-purple-100">✉️</div>

                <div>
                  <p className="contact-info-label">Email</p>

                  <p className="contact-info-value">temaregudie@16gmail.com</p>
                </div>
              </a>

              {/* HOURS */}
              <div className="contact-info-box">
                <div className="contact-info-icon bg-amber-100">🕐</div>

                <div>
                  <p className="contact-info-label">Support Hours</p>

                  <p className="contact-info-value">
                    Mon - Sat, 8:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEND MESSAGE */}
        <div className="contact-message-card mt-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="contact-small-title">SEND US A MESSAGE</p>

            <h2>We'd love to hear from you</h2>

            <p className="text-slate-500 mt-3">
              Have a question, suggestion or need help? Send us a message and
              we'll get back to you.
            </p>
          </div>

          {sent && (
            <div className="max-w-3xl mx-auto mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 font-bold text-center">
              ✅ Your message has been sent successfully.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto mt-8 space-y-5"
          >
            {/* NAME */}
            <div>
              <label className="contact-label">Your Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="contact-input"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="contact-label">Your Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="contact-input"
                required
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="contact-label">Your Message</label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Write your message..."
                className="contact-input resize-none"
                required
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={sending}
              className="contact-send-button"
            >
              {sending ? "Sending..." : "📨 Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
