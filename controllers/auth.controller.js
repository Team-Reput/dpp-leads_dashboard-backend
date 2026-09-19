// This file holds the ACTUAL LOGIC for logging in.
// A "controller" is just a function that: reads the request, talks to the
// database, and sends back a response. Routes (Step 5) just point to these.

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // your existing DB connection

// POST /api/auth/login
// Called when the user clicks "Sign in" on the login screen
async function login(req, res) {
  const { email, password } = req.body;
  // org = 'bluwin' or 'reput_ai' — whichever tab was selected

  try {
    // Ask Postgres for this user, using the function we already built
    const result = await pool.query(
     
  "SELECT dbo.fn_usp_get_dashboard_user_by_email($1) AS result",
  [email]

    );

    const found = result.rows[0].result;
      
    // found.success will be false if no matching user exists

    if (!found.success) {
      
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    // Compare the typed password against the stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      found.data.password_hash
    );
   
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        status_code: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    // Password correct — create a login token valid for 8 hours
    const token = jwt.sign(
      { user_id: found.data.user_id, org: found.data.org, email: found.data.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Send the token back — Angular will store this and send it on every
    // future request to prove the user is logged in
    return res.json({
      success: true,
      status_code: 200,
      message: "Login successful",
      data: {
        token,
        user_id: found.data.user_id,
        org: found.data.org,
        email: found.data.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Server error during login",
      data: null,
    });
  }
}

// Export this function so routes/auth.routes.js can use it
module.exports = { login };