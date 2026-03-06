const CACHE_KEY = "mfCalculator_state";

document.addEventListener("DOMContentLoaded", () => {
    const amountSlider = document.getElementById("amount-slider");
    const rateSlider = document.getElementById("rate-slider");
    const yearsSlider = document.getElementById("years-slider");
    const holdYearsSlider = document.getElementById("hold-years-slider");
    const startYearSlider = document.getElementById("start-year-slider");

    const amountDisplay = document.getElementById("amount-display");
    const rateDisplay = document.getElementById("rate-display");
    const yearsDisplay = document.getElementById("years-display");
    const holdYearsDisplay = document.getElementById("hold-years-display");
    const startYearDisplay = document.getElementById("start-year-display");

    const amountInput = document.getElementById("amount-input");
    const rateInput = document.getElementById("rate-input");
    const yearsInput = document.getElementById("years-input");
    const holdYearsInput = document.getElementById("hold-years-input");
    const startYearInput = document.getElementById("start-year-input");

    const amountLabel = document.getElementById("amount-label");
    const yearsLabel = document.getElementById("years-label");
    const holdYearsGroup = document.getElementById("hold-years-group");
    const startYearGroup = document.getElementById("start-year-group");
    const modeBtns = document.querySelectorAll(".mode-btn");

    let currentMode = "sip";
    let donutChart = null;
    let lineChart = null;

    function formatIndianCurrency(num) {
        const n = Math.round(num);
        const str = n.toString();
        if (str.length <= 3) return "₹" + str;
        let last3 = str.slice(-3);
        let remaining = str.slice(0, -3);
        let formatted = "";
        while (remaining.length > 2) {
            formatted = "," + remaining.slice(-2) + formatted;
            remaining = remaining.slice(0, -2);
        }
        formatted = remaining + formatted + "," + last3;
        return "₹" + formatted;
    }

    function updateSliderTrack(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty("--progress", pct + "%");
    }

    function saveState() {
        try {
            const state = {
                mode: currentMode,
                amount: parseFloat(amountSlider.value),
                rate: parseFloat(rateSlider.value),
                years: parseInt(yearsSlider.value, 10),
                holdYears: parseInt(holdYearsSlider.value, 10),
                startYear: parseInt(startYearSlider.value, 10),
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn("Could not save calculator state", e);
        }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return false;
            const state = JSON.parse(raw);
            const mode = state.mode === "sip" ? "sip" : "lumpsum";
            let amount = Number(state.amount);
            const rate = Math.max(1, Math.min(50, Number(state.rate) || 12));
            const years = Math.max(1, Math.min(60, parseInt(state.years, 10) || 10));
            const holdYears = Math.max(0, Math.min(40, parseInt(state.holdYears, 10) || 0));
            const startYear = Math.max(2026, Math.min(2080, parseInt(state.startYear, 10) || 2026));

            currentMode = mode;
            modeBtns.forEach((b) => {
                b.classList.toggle("active", b.dataset.mode === mode);
            });

            if (mode === "sip") {
                amountLabel.textContent = "Monthly SIP Amount";
                yearsLabel.textContent = "SIP Duration";
                amountSlider.min = 500;
                amountSlider.max = 500000;
                amountSlider.step = 500;
                amount = Math.max(500, Math.min(500000, amount || 5000));
                holdYearsGroup.style.display = "block";
                startYearGroup.style.display = "block";
            } else {
                amountLabel.textContent = "Total Investment";
                yearsLabel.textContent = "Time Period";
                amountSlider.min = 500;
                amountSlider.max = 10000000;
                amountSlider.step = 500;
                amount = Math.max(500, Math.min(10000000, amount || 250000));
                holdYearsGroup.style.display = "none";
                startYearGroup.style.display = "block";
            }

            amountSlider.value = amount;
            rateSlider.value = rate;
            yearsSlider.value = years;
            holdYearsSlider.value = holdYears;
            startYearSlider.value = startYear;

            amountDisplay.textContent = formatIndianCurrency(amount);
            rateDisplay.textContent = rate + "%";
            yearsDisplay.textContent = years + " Year" + (years !== 1 ? "s" : "");
            holdYearsDisplay.textContent = holdYears + " Year" + (holdYears !== 1 ? "s" : "");
            startYearDisplay.textContent = startYear;

            [amountSlider, rateSlider, yearsSlider, holdYearsSlider, startYearSlider].forEach(updateSliderTrack);
            return true;
        } catch (e) {
            console.warn("Could not load calculator state", e);
            return false;
        }
    }

    function setupEditableField(display, input, slider, formatter) {
        display.addEventListener("click", () => {
            display.classList.add("hidden");
            input.classList.add("visible");
            input.value = slider.value;
            input.focus();
        });

        input.addEventListener("blur", () => {
            applyManualInput(input, slider, display, formatter);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                applyManualInput(input, slider, display, formatter);
            }
        });
    }

    function applyManualInput(input, slider, display, formatter) {
        let val = parseFloat(input.value);
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        if (isNaN(val)) val = parseFloat(slider.value);
        val = Math.max(min, Math.min(max, val));

        slider.value = val;
        updateSliderTrack(slider);
        display.textContent = formatter(val);
        display.classList.remove("hidden");
        input.classList.remove("visible");
        saveState();
        calculate();
    }

    setupEditableField(amountDisplay, amountInput, amountSlider, formatIndianCurrency);
    setupEditableField(rateDisplay, rateInput, rateSlider, (v) => v + "%");
    setupEditableField(yearsDisplay, yearsInput, yearsSlider, (v) => v + " Year" + (v != 1 ? "s" : ""));
    setupEditableField(holdYearsDisplay, holdYearsInput, holdYearsSlider, (v) => v + " Year" + (v != 1 ? "s" : ""));
    setupEditableField(startYearDisplay, startYearInput, startYearSlider, (v) => v);

    modeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            modeBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentMode = btn.dataset.mode;

            if (currentMode === "sip") {
                amountLabel.textContent = "Monthly SIP Amount";
                yearsLabel.textContent = "SIP Duration";
                amountSlider.min = 500;
                amountSlider.max = 500000;
                amountSlider.step = 500;
                amountSlider.value = 5000;
                amountDisplay.textContent = formatIndianCurrency(5000);
                holdYearsGroup.style.display = "block";
            } else {
                amountLabel.textContent = "Total Investment";
                yearsLabel.textContent = "Time Period";
                amountSlider.min = 500;
                amountSlider.max = 10000000;
                amountSlider.step = 500;
                amountSlider.value = 250000;
                amountDisplay.textContent = formatIndianCurrency(250000);
                holdYearsGroup.style.display = "none";
            }

            updateSliderTrack(amountSlider);
            saveState();
            calculate();
        });
    });

    [amountSlider, rateSlider, yearsSlider, holdYearsSlider, startYearSlider].forEach((slider) => {
        slider.addEventListener("input", () => {
            updateSliderTrack(slider);

            if (slider === amountSlider) {
                amountDisplay.textContent = formatIndianCurrency(slider.value);
            } else if (slider === rateSlider) {
                rateDisplay.textContent = slider.value + "%";
            } else if (slider === yearsSlider) {
                const y = slider.value;
                yearsDisplay.textContent = y + " Year" + (y != 1 ? "s" : "");
            } else if (slider === holdYearsSlider) {
                const y = slider.value;
                holdYearsDisplay.textContent = y + " Year" + (y != 1 ? "s" : "");
            } else if (slider === startYearSlider) {
                startYearDisplay.textContent = slider.value;
            }

            saveState();
            calculate();
        });

        updateSliderTrack(slider);
    });

    async function calculate() {
        const amount = parseFloat(amountSlider.value);
        const rate = parseFloat(rateSlider.value);
        const years = parseInt(yearsSlider.value);
        const holdYears = parseInt(holdYearsSlider.value);
        const startYear = parseInt(startYearSlider.value);

        try {
            const res = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: currentMode, amount, rate, years, holdYears, startYear }),
            });
            const data = await res.json();
            updateResults(data);
        } catch (err) {
            console.error("Calculation error:", err);
        }
    }

    function updateResults(data) {
        document.getElementById("total-invested").textContent = formatIndianCurrency(data.totalInvested);
        document.getElementById("est-returns").textContent = formatIndianCurrency(data.estReturns);
        document.getElementById("total-value").textContent = formatIndianCurrency(data.totalValue);

        updateDonutChart(data.totalInvested, data.estReturns);
        updateLineChart(data.yearlyData);
        updateTable(data.yearlyData);
    }

    function updateDonutChart(invested, returns) {
        const ctx = document.getElementById("donutChart").getContext("2d");

        if (donutChart) {
            donutChart.data.datasets[0].data = [invested, returns];
            donutChart.update("none");
            return;
        }

        donutChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Invested Amount", "Est. Returns"],
                datasets: [{
                    data: [invested, returns],
                    backgroundColor: ["#d1d5db", "#1aab5c"],
                    borderWidth: 0,
                    hoverOffset: 6,
                }],
            },
            options: {
                cutout: "65%",
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "#1a1a2e",
                        titleFont: { family: "Poppins", weight: "600" },
                        bodyFont: { family: "Poppins" },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => " " + formatIndianCurrency(ctx.raw),
                        },
                    },
                },
            },
        });
    }

    function updateLineChart(yearlyData) {
        const ctx = document.getElementById("lineChart").getContext("2d");
        const labels = yearlyData.map((d) => {
            if (d.phase === "hold") return d.calendarYear + " (Hold)";
            return String(d.calendarYear);
        });
        const investedData = yearlyData.map((d) => d.invested);
        const valueData = yearlyData.map((d) => d.value);

        if (lineChart) {
            lineChart.data.labels = labels;
            lineChart.data.datasets[0].data = investedData;
            lineChart.data.datasets[1].data = valueData;
            lineChart.update();
            return;
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
        gradient.addColorStop(0, "rgba(26, 171, 92, 0.25)");
        gradient.addColorStop(1, "rgba(26, 171, 92, 0.02)");

        lineChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Invested Amount",
                        data: investedData,
                        borderColor: "#9ca3af",
                        backgroundColor: "rgba(156, 163, 175, 0.08)",
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#9ca3af",
                        pointBorderColor: "#fff",
                        pointBorderWidth: 2,
                    },
                    {
                        label: "Total Value",
                        data: valueData,
                        borderColor: "#1aab5c",
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: "#1aab5c",
                        pointBorderColor: "#fff",
                        pointBorderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            font: { family: "Poppins", size: 12, weight: "500" },
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 20,
                        },
                    },
                    tooltip: {
                        backgroundColor: "#1a1a2e",
                        titleFont: { family: "Poppins", weight: "600" },
                        bodyFont: { family: "Poppins" },
                        padding: 14,
                        cornerRadius: 10,
                        callbacks: {
                            label: (ctx) => " " + ctx.dataset.label + ": " + formatIndianCurrency(ctx.raw),
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: "Poppins", size: 11 },
                            color: "#9ca3af",
                            maxRotation: 45,
                            autoSkip: true,
                            maxTicksLimit: 10,
                        },
                    },
                    y: {
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: {
                            font: { family: "Poppins", size: 11 },
                            color: "#9ca3af",
                            callback: (val) => {
                                if (val >= 10000000) return "₹" + (val / 10000000).toFixed(1) + "Cr";
                                if (val >= 100000) return "₹" + (val / 100000).toFixed(1) + "L";
                                if (val >= 1000) return "₹" + (val / 1000).toFixed(0) + "K";
                                return "₹" + val;
                            },
                        },
                    },
                },
            },
        });
    }

    function updateTable(yearlyData) {
        const tbody = document.querySelector("#breakdown-table tbody");
        tbody.innerHTML = yearlyData
            .map(
                (d) => `<tr class="${d.phase === 'hold' ? 'hold-phase' : ''}">
                    <td>${d.calendarYear}${d.phase === 'hold' ? ' <span class="phase-badge">Hold</span>' : ''}</td>
                    <td>${formatIndianCurrency(d.invested)}</td>
                    <td>${formatIndianCurrency(d.returns)}</td>
                    <td>${formatIndianCurrency(d.value)}</td>
                </tr>`
            )
            .join("");
    }

    const viewResultsBtn = document.getElementById("view-results-btn");
    const gridBottom = document.querySelector(".grid-bottom");

    viewResultsBtn.addEventListener("click", () => {
        gridBottom.classList.add("visible");
        gridBottom.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    loadState();
    calculate();
});
