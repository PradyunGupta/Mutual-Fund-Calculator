# Calci – Mutual Fund Returns Calculator

A web-based calculator to estimate mutual fund returns with support for both **Lump Sum** and **SIP** (Systematic Investment Plan) investments. Visualize the power of compounding with interactive charts and year-by-year breakdowns.

## Features

- **Lump Sum & SIP modes** – Switch between one-time investment and monthly SIP
- **Interactive sliders** – Amount (₹500–₹10M for lump sum, ₹500–₹5L for SIP), expected return (1–50% P.A.), and time period (1–60 years)
- **Compounded returns** – Real-time calculation of estimated returns and total value
- **Donut chart** – Visual split of invested amount vs estimated returns
- **Growth line chart** – Interactive chart showing invested amount and total value over time
- **Year-by-year breakdown** – Table of invested amount, returns, and total value for each year
- **Local storage cache** – Restores your last-used inputs when you return
- **Responsive layout** – 2×2 grid on desktop, stacked on mobile

## Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, JavaScript
- **Charts:** Chart.js

## Setup

### Prerequisites

- Python 3.8+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PradyunGupta/Mutual-Fund-Calculator.git
   cd Mutual-Fund-Calculator
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Run

```bash
python app.py
```

Open [http://127.0.0.1:5050](http://127.0.0.1:5050) in your browser.

## Project Structure

```
mfCalculator/
├── app.py              # Flask app and calculation API
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
├── static/
│   ├── css/style.css
│   ├── js/app.js
│   └── franklin.webp   # Favicon
└── venv/               # Virtual environment (ignored by git)
```

## API

**POST** `/api/calculate`

Request body:
```json
{
  "mode": "lumpsum" | "sip",
  "amount": 250000,
  "rate": 12,
  "years": 10
}
```

Response:
```json
{
  "totalInvested": 250000,
  "estReturns": 526462.05,
  "totalValue": 776462.05,
  "yearlyData": [...]
}
```

## License

MIT
