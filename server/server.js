require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const app = require("./app");
const pool = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // =====================================================
    // ENV VALIDATION
    // =====================================================

    const requiredEnv = [
      "DB_HOST",
      "DB_USER",
      "DB_NAME",
      "DB_PORT",
      "JWT_SECRET",
    ];

    const missingEnv = requiredEnv.filter((key) => !process.env[key]);

    if (missingEnv.length > 0) {
      console.error("❌ Missing environment variables:");
      console.error(missingEnv.join(", "));
      process.exit(1);
    }

    // =====================================================
    // JWT SECURITY VALIDATION
    // =====================================================

    if (process.env.JWT_SECRET.length < 32) {
      console.error("❌ JWT_SECRET must be at least 32 characters long.");
      process.exit(1);
    }

    // =====================================================
    // DATABASE CHECK
    // =====================================================

    const connection = await pool.getConnection();

    console.log("✅ MySQL Connected Successfully");
    console.log("✅ Database:", process.env.DB_NAME);
    console.log("✅ MySQL Port:", process.env.DB_PORT);

    connection.release();

    // =====================================================
    // START SERVER
    // =====================================================

    const server = app.listen(PORT, () => {
      console.log("=================================");
      console.log("🚀 ShopSphere API");
      console.log(`🌐 http://localhost:${PORT}`);
      console.log("🔐 JWT: configured");
      console.log("=================================");
    });

    // =====================================================
    // GRACEFUL SHUTDOWN
    // =====================================================

    const shutdown = async (signal) => {
      console.log(`\n⚠️ ${signal} received. Shutting down...`);

      server.close(async () => {
        try {
          await pool.end();
          console.log("✅ Database pool closed.");
          process.exit(0);
        } catch (error) {
          console.error("❌ Shutdown error:", error.message);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("=================================");
    console.error("❌ SERVER STARTUP FAILED");
    console.error("=================================");
    console.error(error.message);

    process.exit(1);
  }
}

startServer();
