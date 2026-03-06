import os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    mode = data.get("mode", "lumpsum")
    amount = float(data.get("amount", 0))
    rate = float(data.get("rate", 0)) / 100
    years = int(data.get("years", 0))
    hold_years = int(data.get("holdYears", 0))

    yearly_data = []

    if mode == "lumpsum":
        total_invested = amount
        for year in range(1, years + 1):
            value = amount * ((1 + rate) ** year)
            yearly_data.append({
                "year": year,
                "invested": round(total_invested, 2),
                "value": round(value, 2),
                "returns": round(value - total_invested, 2),
            })
        final_value = amount * ((1 + rate) ** years)
        est_returns = final_value - total_invested

    else:
        monthly_rate = rate / 12
        cumulative_value = 0
        # SIP accumulation phase
        for year in range(1, years + 1):
            months = year * 12
            if monthly_rate == 0:
                cumulative_value = amount * months
            else:
                cumulative_value = amount * (
                    ((1 + monthly_rate) ** months - 1) / monthly_rate
                ) * (1 + monthly_rate)
            invested_so_far = amount * months
            yearly_data.append({
                "year": year,
                "invested": round(invested_so_far, 2),
                "value": round(cumulative_value, 2),
                "returns": round(cumulative_value - invested_so_far, 2),
                "phase": "sip",
            })

        total_invested = amount * 12 * years
        value_at_sip_end = cumulative_value

        # Holding phase (no new contributions, just compounding)
        for year in range(1, hold_years + 1):
            value_at_sip_end = value_at_sip_end * (1 + rate)
            yearly_data.append({
                "year": years + year,
                "invested": round(total_invested, 2),
                "value": round(value_at_sip_end, 2),
                "returns": round(value_at_sip_end - total_invested, 2),
                "phase": "hold",
            })

        final_value = value_at_sip_end
        est_returns = final_value - total_invested

    return jsonify({
        "totalInvested": round(total_invested, 2),
        "estReturns": round(est_returns, 2),
        "totalValue": round(final_value, 2),
        "yearlyData": yearly_data,
        "sipYears": years,
        "holdYears": hold_years,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
