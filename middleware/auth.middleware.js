// A "middleware" runs BEFORE the controller, on every request to a
// protected route. Its job here: check the login token is present and
// valid before letting the request continue.

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  // The frontend sends the token like: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      message: "No login token provided",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token was really issued by this server and hasn't expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info so controllers can use it if needed
    next(); // token is valid — let the request continue to the controller
  } catch (err) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      message: "Invalid or expired login token",
      data: null,
    });
  }
}

module.exports = { requireAuth };