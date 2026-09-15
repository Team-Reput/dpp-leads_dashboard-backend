// This file holds the logic for everything AFTER login:
// the stat cards, the submissions table, the detail modal, and the
// "assign rep" / "mark as contacted" actions.

const pool = require("../config/db");

// GET /api/dashboard/stats
// Feeds the 4 cards at the top: Total Submissions, This Week, Avg Readiness, Advanced Band
async function getStats(req, res) {
  try {
    const result = await pool.query("SELECT dbo.fn_usp_get_dashboard_stats() AS result");
    return res.json(result.rows[0].result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, status_code: 500, message: "Failed to load stats", data: null });
  }
}

// GET /api/dashboard/submissions?search=&band=&market=
// Feeds the table rows (company, category, markets, readiness, band)
async function getSubmissions(req, res) {
  try {
    const result = await pool.query("SELECT dbo.fn_get_dashboard_leads() AS result");
    const rows = result.rows[0].result || [];

    // fn_get_dashboard_leads() returns a bare JSON array with short field
    // names — remap it here so the response shape matches what the
    // Angular dashboard component expects.
    const data = rows.map((row) => ({
      ass_id: row.ass_id,
      company: row.company,
      contact_name: row.contact,
      contact_email: row.email,
      category: row.category,
      export_markets: row.export_market,   // note: plural in frontend, singular in SQL
      export_volume: row.export_volume ?? '',
      submitted: row.date,
      readiness_percent: row.score,
      band_label: row.band
    }));

    return res.json({
      success: true,
      status_code: 200,
      message: "Submissions fetched",
      data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, status_code: 500, message: "Failed to load submissions", data: null });
  }
}

// GET /api/dashboard/submissions/:ass_id
// Feeds the detail modal when "View" is clicked on a row
async function getSubmissionDetail(req, res) {
  const { ass_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT dbo.fn_get_dashboard_lead_detail($1) AS result",
      [ass_id]
    );
    const raw = result.rows[0].result;

    const STATUS_MAP = { STRONG: 'yes', PARTIAL: 'partial', GAP: 'no' };

    const categories = (raw.categories || []).map((cat) => ({
      label: cat.name,
      status: STATUS_MAP[cat.status] || 'no'
    }));

    const data = {
      ass_id: Number(ass_id),
      contact: {
        company: raw.company,
        full_name: raw.contact,
        email: raw.email
      },
      profile: {
        product_category: raw.category,
        export_markets: raw.export_market
      },
      score: {
        readiness_percent: raw.score,
        band_label: raw.band,
        addl_count: raw.addl_count ?? 0
      },
      categories,
      followup: {
        assigned_rep: raw.followup?.assigned_rep ?? null,
        contacted: raw.followup?.contacted ?? false
      }
    };

    return res.json({
      success: true,
      status_code: 200,
      message: "Submission detail fetched",
      data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, status_code: 500, message: "Failed to load submission detail", data: null });
  }
}

// POST /api/dashboard/submissions/:ass_id/followup
// Called when "Assign to regional rep" or "Mark as contacted" is clicked
async function updateFollowup(req, res) {
  const { ass_id } = req.params;
  const { assigned_rep, contacted } = req.body;

  try {
    const result = await pool.query(
      "SELECT dbo.fn_usp_upsert_assessment_followup($1, $2, $3) AS result",
      [ass_id, assigned_rep || null, contacted ?? false]
    );
    return res.json(result.rows[0].result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, status_code: 500, message: "Failed to update follow-up", data: null });
  }
}

module.exports = { getStats, getSubmissions, getSubmissionDetail, updateFollowup };