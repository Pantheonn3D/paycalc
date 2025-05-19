document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    const themeToggle = document.getElementById('theme-toggle');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNavMenu = document.getElementById('main-navigation-menu');
    
    const resultsTabs = document.querySelectorAll('.results-tabs .tab-btn[data-result-tab]');
    const resultContents = document.querySelectorAll('.results-content .result-tab-content');

    const periodBtns = document.querySelectorAll('.results-summary .primary-card .period-btn'); // Only target period buttons in the main summary card
    
    const toggleAdvancedBtn = document.getElementById('toggle-advanced');
    const advancedFields = document.getElementById('advanced-fields');
    const includeBonusCheckbox = document.getElementById('include-bonus');
    const bonusInput = document.getElementById('bonus-input');
    const faqItems = document.querySelectorAll('.faq-item');
        
    const salaryForm = document.getElementById('salary-form');
    const incomeType = document.getElementById('income-type');
    const annualInput = document.getElementById('annual-input');
    const hourlyInputs = document.getElementById('hourly-inputs');
    const monthlyInput = document.getElementById('monthly-input');
    const numberSteppers = document.querySelectorAll('.number-stepper');
    const resultsContainer = document.getElementById('results');
    const newCalculationBtn = document.getElementById('new-calculation');
    const printResultsBtn = document.getElementById('print-results');

    let incomeBreakdownChart = null;
    let taxDistributionChart = null;
    let paycheckBreakdownChart = null;
    let taxBracketsChart = null;
    let netVsGrossChart = null;
    let lastCalculationData = null; 
    
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const html = document.documentElement;
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            if (!resultsContainer.classList.contains('hidden') && lastCalculationData) {
                updateCharts(lastCalculationData);
            }
        });
    }
    
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
    
    if (mobileMenuToggle && mainNavMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = mainNavMenu.classList.toggle('mobile-nav-open');
            this.setAttribute('aria-expanded', isExpanded.toString());
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    if (resultsTabs.length > 0 && resultContents.length > 0) {
        resultsTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetContentId = this.getAttribute('aria-controls');
                
                resultsTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                resultContents.forEach(content => {
                    if (content.id === targetContentId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }
        
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.dataset.period;
            const container = this.closest('.time-period');
            
            container.querySelectorAll('.period-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-checked', 'true');
            
            const amountContainer = container.nextElementSibling;
            if (amountContainer && amountContainer.classList.contains('amount-container')) {
                amountContainer.querySelectorAll('.amount').forEach(a => a.classList.add('hidden'));
                const targetAmountEl = amountContainer.querySelector(`#${period}-net`);
                if (targetAmountEl) targetAmountEl.classList.remove('hidden');
            }
        });
    });
    
    if (toggleAdvancedBtn && advancedFields) {
        toggleAdvancedBtn.addEventListener('click', function() {
            const isHidden = advancedFields.classList.toggle('hidden'); // This toggles and returns true if class was removed (now visible)
            const nowExpanded = !isHidden; // If hidden was removed, it's now expanded
            
            this.setAttribute('aria-expanded', nowExpanded.toString());
            const iconElement = this.querySelector('i.fa-sliders-h + i'); // Get the chevron icon specifically

            if (nowExpanded) { // If it's now visible/expanded
                this.innerHTML = `<i class="fas fa-sliders-h"></i> Hide Advanced Options <i class="fas fa-chevron-up"></i>`;
            } else { // If it's now hidden
                this.innerHTML = `<i class="fas fa-sliders-h"></i> Show Advanced Options <i class="fas fa-chevron-down"></i>`;
            }
        });
    }
    
    if (includeBonusCheckbox && bonusInput) {
        includeBonusCheckbox.addEventListener('change', function() {
            if (this.checked) {
                bonusInput.classList.add('visible'); // Use .visible to show
            } else {
                bonusInput.classList.remove('visible'); // Remove .visible to hide
                const bonusAmountInput = document.getElementById('bonus-amount');
                if (bonusAmountInput) bonusAmountInput.value = '';
            }
        });
    }
    
    faqItems.forEach(item => {
        const questionHeader = item.querySelector('.faq-question'); // The clickable area
        const toggleButton = item.querySelector('.faq-toggle'); // The button itself
        // const answer = item.querySelector('.faq-answer'); // No longer directly needed for JS logic here

        if (questionHeader && toggleButton) {
            questionHeader.addEventListener('click', () => {
                const isCurrentlyActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.faq-toggle').setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                if (isCurrentlyActive) {
                    item.classList.remove('active');
                    toggleButton.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    toggleButton.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });
        
    numberSteppers.forEach(stepper => {
        const input = stepper.querySelector('input[type="number"]');
        const minusBtn = stepper.querySelector('.minus');
        const plusBtn = stepper.querySelector('.plus');
        
        if (!input || !minusBtn || !plusBtn) return;

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value) || 0;
            const min = parseInt(input.min);
            if (!isNaN(min) && currentValue > min) {
                input.value = currentValue - 1;
            } else if (isNaN(min) && currentValue > 0) { 
                 input.value = currentValue - 1;
            }
            triggerEvent(input, 'change'); 
        });
        
        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value) || 0;
            const max = parseInt(input.max);
             if (!isNaN(max) && currentValue < max) {
                input.value = currentValue + 1;
            } else if (isNaN(max)) { 
                input.value = currentValue + 1;
            }
            triggerEvent(input, 'change');
        });
    });
    
    function triggerEvent(element, eventName) {
        if(element) {
            const event = new Event(eventName, { bubbles: true });
            element.dispatchEvent(event);
        }
    }
    
    if (incomeType) {
        incomeType.addEventListener('change', function() {
            const selectedType = this.value;
            if(annualInput) annualInput.classList.add('hidden');
            if(hourlyInputs) hourlyInputs.classList.add('hidden');
            if(monthlyInput) monthlyInput.classList.add('hidden');
            
            if (selectedType === 'annual' && annualInput) {
                annualInput.classList.remove('hidden');
            } else if (selectedType === 'hourly' && hourlyInputs) {
                hourlyInputs.classList.remove('hidden');
            } else if (selectedType === 'monthly' && monthlyInput) {
                monthlyInput.classList.remove('hidden');
            }
        });
    }
    
    if (salaryForm) {
        salaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
            
            setTimeout(() => {
                calculateSalary();
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
                if (resultsContainer) {
                    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300); 
        });
    }
        
    if (newCalculationBtn && salaryForm && resultsContainer) {
        newCalculationBtn.addEventListener('click', function() {
            resultsContainer.classList.add('hidden');
            salaryForm.reset(); 
            triggerEvent(incomeType, 'change');
            if (includeBonusCheckbox) includeBonusCheckbox.checked = false;
            triggerEvent(includeBonusCheckbox, 'change');
            if (advancedFields && toggleAdvancedBtn && toggleAdvancedBtn.getAttribute('aria-expanded') === 'true') {
                toggleAdvancedBtn.click(); 
            }
            lastCalculationData = null; 
            
            const calculatorSection = document.getElementById('calculator');
            if (calculatorSection) {
                 window.scrollTo({
                    top: calculatorSection.offsetTop - (document.querySelector('header')?.offsetHeight || 80),
                    behavior: 'smooth'
                });
            }
        });
    }

    if (printResultsBtn) {
        printResultsBtn.addEventListener('click', () => {
            if (resultsContainer && !resultsContainer.classList.contains('hidden')) {
                window.print();
            } else {
                alert("Please perform a calculation first to see the results before printing.");
            }
        });
    }

    function setupPlaceholderButton(buttonId, message) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                alert(message || "This feature is for demonstration only / planned for a future version.");
            });
        }
    }
    const placeholderMessage = "This feature is for demonstration only and will be implemented in a future version.";
    setupPlaceholderButton('download-pdf', placeholderMessage);


    function calculateSalary() {
        const selectedIncomeType = incomeType.value;
        let annualGross = 0;
        
        if (selectedIncomeType === 'annual') {
            annualGross = parseFloat(document.getElementById('annual-salary').value) || 0;
        } else if (selectedIncomeType === 'hourly') {
            const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 0;
            const hoursPerWeek = parseFloat(document.getElementById('hours-per-week').value) || 40;
            const weeksPerYear = parseFloat(document.getElementById('weeks-per-year').value) || 52;
            annualGross = hourlyRate * hoursPerWeek * weeksPerYear;
        } else if (selectedIncomeType === 'monthly') {
            const monthlySalary = parseFloat(document.getElementById('monthly-salary').value) || 0;
            annualGross = monthlySalary * 12;
        }
        
        const filingStatus = document.getElementById('filing-status').value;
        const location = document.getElementById('location').value;
        const dependents = parseInt(document.getElementById('dependents').value) || 0;
        const retirementPercent = parseFloat(document.getElementById('retirement').value) || 0;
        const healthInsuranceMonthly = parseFloat(document.getElementById('health-insurance').value) || 0;
        const hsaContributionAnnual = parseFloat(document.getElementById('hsa-contribution').value) || 0;
        const fsaContributionAnnual = parseFloat(document.getElementById('fsa-contribution').value) || 0;
        const otherPretaxDeductionsAnnual = parseFloat(document.getElementById('other-pretax').value) || 0;
        const otherPosttaxDeductionsAnnual = parseFloat(document.getElementById('other-posttax').value) || 0;
        const annualBonus = includeBonusCheckbox.checked ? (parseFloat(document.getElementById('bonus-amount').value) || 0) : 0;
        
        const studentLoanInterest = parseFloat(document.getElementById('student-loan-interest').value) || 0;
        const childTaxCreditApplicable = document.getElementById('child-tax-credit').checked;
        const educationCreditApplicable = document.getElementById('education-credit').checked;

        const totalGrossIncome = annualGross + annualBonus;
        const retirementAmountAnnual = annualGross * (retirementPercent / 100); 
        const healthInsuranceAnnual = healthInsuranceMonthly * 12;
        
        const totalPreTaxDeductions = retirementAmountAnnual + healthInsuranceAnnual + hsaContributionAnnual + fsaContributionAnnual + otherPretaxDeductionsAnnual;
        
        const preliminaryTaxableIncome = totalGrossIncome - totalPreTaxDeductions;
        
        const taxes = calculateTaxes(
            preliminaryTaxableIncome, 
            totalGrossIncome, 
            filingStatus, 
            location, 
            dependents, 
            childTaxCreditApplicable, 
            educationCreditApplicable, 
            studentLoanInterest
        );
        
        const totalTaxes = taxes.federal + taxes.state + taxes.socialSecurity + taxes.medicare;
        const totalDeductionsAndTaxes = totalPreTaxDeductions + totalTaxes + otherPosttaxDeductionsAnnual;
        const annualNetPay = totalGrossIncome - totalDeductionsAndTaxes;
        
        const effectiveTaxRate = totalGrossIncome > 0 ? (totalTaxes / totalGrossIncome) * 100 : 0;

        lastCalculationData = {
            gross: totalGrossIncome,
            bonus: annualBonus,
            taxableForFederalDisplay: taxes.finalFederalTaxableIncome, 
            federal: taxes.federal,
            state: taxes.state,
            socialSecurity: taxes.socialSecurity,
            medicare: taxes.medicare,
            retirement: retirementAmountAnnual,
            health: healthInsuranceAnnual,
            hsaFsa: hsaContributionAnnual + fsaContributionAnnual,
            otherPretax: otherPretaxDeductionsAnnual,
            otherPosttax: otherPosttaxDeductionsAnnual,
            net: annualNetPay,
            effectiveTaxRate: effectiveTaxRate,
            brackets: taxes.federalBracketInfo 
        };
        
        updateResults(lastCalculationData);
        updateInsights(lastCalculationData, retirementPercent);
        resultsContainer.classList.remove('hidden');
    }
    
    function calculateTaxes(incomeBeforeStdDeduction, totalGrossIncomeForFICA, filingStatus, location, dependents, childTaxCreditApplicable, educationCreditApplicable, studentLoanInterestDeduction) {
        const stdDeductions = {
            single: 13850, 'married-joint': 27700, 'married-separate': 13850, head: 20800
        }; // 2023 Example
        const standardDeduction = stdDeductions[filingStatus] || 13850;
        const actualStudentLoanInterestDeduction = Math.min(studentLoanInterestDeduction, 2500);
        const agiForFederal = Math.max(0, incomeBeforeStdDeduction - actualStudentLoanInterestDeduction);
        const federalTaxableIncome = Math.max(0, agiForFederal - standardDeduction);
        
        const federalBrackets = {
            single: [ { rate: 0.10, limit: 11000 },{ rate: 0.12, limit: 44725 },{ rate: 0.22, limit: 95375 },{ rate: 0.24, limit: 182100 },{ rate: 0.32, limit: 231250 },{ rate: 0.35, limit: 578125 },{ rate: 0.37, limit: Infinity } ],
            'married-joint': [ { rate: 0.10, limit: 22000 },{ rate: 0.12, limit: 89450 },{ rate: 0.22, limit: 190750 },{ rate: 0.24, limit: 364200 },{ rate: 0.32, limit: 462500 },{ rate: 0.35, limit: 693750 },{ rate: 0.37, limit: Infinity } ],
            'married-separate': [ { rate: 0.10, limit: 11000 },{ rate: 0.12, limit: 44725 },{ rate: 0.22, limit: 95375 },{ rate: 0.24, limit: 182100 },{ rate: 0.32, limit: 231250 },{ rate: 0.35, limit: 346875 },{ rate: 0.37, limit: Infinity } ],
            head: [ { rate: 0.10, limit: 15700 },{ rate: 0.12, limit: 59850 },{ rate: 0.22, limit: 95350 },{ rate: 0.24, limit: 182100 },{ rate: 0.32, limit: 231250 },{ rate: 0.35, limit: 578100 },{ rate: 0.37, limit: Infinity } ]
        }; // 2023 Example
        
        let federalTax = 0;
        let federalBracketInfo = []; 
        let incomeRemaining = federalTaxableIncome;
        let prevLimit = 0;

        (federalBrackets[filingStatus] || federalBrackets.single).forEach(bracket => {
            if (incomeRemaining <= 0) return;
            const taxableInBracket = Math.min(incomeRemaining, bracket.limit - prevLimit);
            const taxInBracket = taxableInBracket * bracket.rate;
            federalTax += taxInBracket;
            federalBracketInfo.push({
                rate: bracket.rate * 100,
                min: prevLimit,
                max: bracket.limit === Infinity ? incomeRemaining + prevLimit : bracket.limit, 
                taxableAmount: taxableInBracket,
                taxAmount: taxInBracket
            });
            incomeRemaining -= taxableInBracket;
            prevLimit = bracket.limit;
        });

        if (childTaxCreditApplicable && dependents > 0) {
            federalTax = Math.max(0, federalTax - (dependents * 2000)); 
        }
        if (educationCreditApplicable) {
            federalTax = Math.max(0, federalTax - 2500); 
        }
        federalTax = Math.max(0, federalTax);

        const stateTaxRates = { 'alabama': 0.05, 'alaska': 0, 'arizona': 0.025, 'arkansas': 0.049, 'california': 0.08,  'colorado': 0.044, 'connecticut': 0.055, 'delaware': 0.066, 'florida': 0, 'georgia': 0.0549, 'hawaii': 0.08, 'idaho': 0.058, 'illinois': 0.0495, 'indiana': 0.0315, 'iowa': 0.06, 'kansas': 0.057, 'kentucky': 0.045, 'louisiana': 0.0425, 'maine': 0.0715, 'maryland': 0.05, 'massachusetts': 0.05, 'michigan': 0.0425, 'minnesota': 0.07, 'mississippi': 0.05, 'missouri': 0.0495, 'montana': 0.0675, 'nebraska': 0.0664, 'nevada': 0, 'new-hampshire': 0, 'new-jersey': 0.06, 'new-mexico': 0.049, 'new-york': 0.065, 'north-carolina': 0.0475, 'north-dakota': 0.02, 'ohio': 0.035, 'oklahoma': 0.0475, 'oregon': 0.09, 'pennsylvania': 0.0307, 'rhode-island': 0.045, 'south-carolina': 0.065, 'south-dakota': 0, 'tennessee': 0, 'texas': 0, 'utah': 0.0485, 'vermont': 0.07, 'virginia': 0.05, 'washington': 0, 'west-virginia': 0.055, 'wisconsin': 0.053, 'wyoming': 0 };
        const stateTaxRate = stateTaxRates[location] || 0; 
        const stateTaxableIncome = Math.max(0, incomeBeforeStdDeduction - (stdDeductions[filingStatus]/2)); 
        const stateTax = stateTaxableIncome * stateTaxRate;
        
        const ssWageBase = 168600; // 2024 Example
        const socialSecurityTax = Math.min(totalGrossIncomeForFICA, ssWageBase) * 0.062;
        let medicareTax = totalGrossIncomeForFICA * 0.0145;
        const additionalMedicareThresholds = { single: 200000, 'married-joint': 250000, 'married-separate': 125000, head: 200000 };
        if (totalGrossIncomeForFICA > (additionalMedicareThresholds[filingStatus] || 200000) ) {
            medicareTax += (totalGrossIncomeForFICA - (additionalMedicareThresholds[filingStatus] || 200000)) * 0.009;
        }
        
        return {
            federal: federalTax,
            state: Math.max(0, stateTax),
            socialSecurity: socialSecurityTax,
            medicare: medicareTax,
            finalFederalTaxableIncome: federalTaxableIncome, 
            federalBracketInfo: federalBracketInfo
        };
    }
        
    function formatCurrency(value, digits = 0) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
            minimumFractionDigits: digits, maximumFractionDigits: digits
        }).format(value);
    }
    function formatPercent(value, digits = 1) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: digits, maximumFractionDigits: digits
        }).format(value / 100);
    }

    function updateResults(data) {
        document.getElementById('annual-net').textContent = formatCurrency(data.net);
        document.getElementById('monthly-net').textContent = formatCurrency(data.net / 12);
        document.getElementById('biweekly-net').textContent = formatCurrency(data.net / 26);
        document.getElementById('effective-tax-rate').textContent = formatPercent(data.effectiveTaxRate);
        
        document.getElementById('annual-gross').textContent = formatCurrency(data.gross);
        const totalTaxesCalculated = data.federal + data.state + data.socialSecurity + data.medicare;
        document.getElementById('annual-tax').textContent = formatCurrency(totalTaxesCalculated);
        const totalDeductionsDisplay = data.retirement + data.health + data.hsaFsa + data.otherPretax + data.otherPosttax;
        document.getElementById('annual-deductions').textContent = formatCurrency(totalDeductionsDisplay);
        
        updateProgressBars(data); // Progress bars will show annual data
        updateDetailedTable(data);
        updateCharts(data); 
    }
    
    function updateProgressBars(data) { // Always shows annual data now
        const totalGross = data.gross;
        if (totalGross === 0) { 
            const elements = ['federal-tax', 'state-tax', 'fica', 'retirement', 'benefits', 'other-deductions', 'take-home'];
            elements.forEach(el => {
                const amountEl = document.getElementById(`${el}-amount`);
                const barEl = document.getElementById(`${el}-bar`);
                const percentEl = document.getElementById(`${el}-percent`);
                if(amountEl) amountEl.textContent = formatCurrency(0);
                if(barEl) barEl.style.width = '0%';
                if(percentEl) percentEl.textContent = formatPercent(0);
            });
            return;
        }

        const ficaTotal = data.socialSecurity + data.medicare;
        const benefitsTotal = data.health + data.hsaFsa; 
        const otherDeductionsTotal = data.otherPretax + data.otherPosttax;

        const items = [
            { id: 'federal-tax', amount: data.federal },
            { id: 'state-tax', amount: data.state },
            { id: 'fica', amount: ficaTotal },
            { id: 'retirement', amount: data.retirement },
            { id: 'benefits', amount: benefitsTotal },
            { id: 'other-deductions', amount: otherDeductionsTotal },
            { id: 'take-home', amount: data.net }
        ];

        items.forEach(item => {
            const percentOfGross = (item.amount / totalGross) * 100;
            const amountEl = document.getElementById(`${item.id}-amount`);
            const barEl = document.getElementById(`${item.id}-bar`);
            const percentEl = document.getElementById(`${item.id}-percent`);

            if(amountEl) amountEl.textContent = formatCurrency(item.amount);
            if(barEl) barEl.style.width = `${Math.max(0, Math.min(100, percentOfGross))}%`;
            if(percentEl) percentEl.textContent = formatPercent(percentOfGross);
        });
    }
    
    function updateDetailedTable(data) {
        const totalGross = data.gross;
        const periods = { annual: 1, monthly: 12, biweekly: 26 };
        const ficaTotal = data.socialSecurity + data.medicare;
        const totalPreTaxDed = data.retirement + data.health + data.hsaFsa + data.otherPretax;
        const totalTaxes = data.federal + data.state + ficaTotal;

        const rows = [
            { key: 'gross', value: data.gross, section: 'income' },
            { key: 'bonus', value: data.bonus, section: 'income' },
            { key: 'total-income', value: data.gross, isSubtotal: true, section: 'income'},
            { key: 'retirement', value: data.retirement, section: 'pretax' },
            { key: 'health', value: data.health, section: 'pretax' },
            { key: 'hsa-fsa', value: data.hsaFsa, section: 'pretax' },
            { key: 'other-pretax', value: data.otherPretax, section: 'pretax' },
            { key: 'total-pretax', value: totalPreTaxDed, isSubtotal: true, section: 'pretax'},
            { key: 'taxable', value: data.taxableForFederalDisplay, section: 'taxable' }, 
            { key: 'federal', value: data.federal, section: 'taxes' },
            { key: 'state', value: data.state, section: 'taxes' },
            { key: 'ss', value: data.socialSecurity, section: 'taxes' },
            { key: 'medicare', value: data.medicare, section: 'taxes' },
            { key: 'total-tax', value: totalTaxes, isSubtotal: true, section: 'taxes'},
            { key: 'posttax', value: data.otherPosttax, section: 'posttax' }, 
            { key: 'net', value: data.net, isNetPay: true, section: 'netpay' }
        ];

        rows.forEach(row => {
            const annualEl = document.getElementById(`table-annual-${row.key}`);
            const monthlyEl = document.getElementById(`table-monthly-${row.key}`);
            const biweeklyEl = document.getElementById(`table-biweekly-${row.key}`);
            const percentEl = document.getElementById(`table-${row.key}-percent`);

            if(annualEl) annualEl.textContent = formatCurrency(row.value);
            if(monthlyEl) monthlyEl.textContent = formatCurrency(row.value / periods.monthly);
            if(biweeklyEl) biweeklyEl.textContent = formatCurrency(row.value / periods.biweekly);
            
            const percent = totalGross > 0 ? (row.value / totalGross) * 100 : 0;
            if(percentEl) percentEl.textContent = formatPercent(percent);
        });
    }
    
    function getChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            netIncome: getComputedStyle(document.documentElement).getPropertyValue(isDark ? '--chart-color-1' : '--chart-color-1').trim() || (isDark ? '#60a5fa' : '#3b82f6'),
            taxes: getComputedStyle(document.documentElement).getPropertyValue(isDark ? '--chart-color-4' : '--chart-color-4').trim() || (isDark ? '#f87171' : '#ef4444'),
            retirement: getComputedStyle(document.documentElement).getPropertyValue(isDark ? '--chart-color-5' : '--chart-color-5').trim() || (isDark ? '#a78bfa' : '#8b5cf6'),
            healthAndBenefits: getComputedStyle(document.documentElement).getPropertyValue(isDark ? '--chart-color-2' : '--chart-color-2').trim() || (isDark ? '#34d399' : '#10b981'), 
            otherDeductions: getComputedStyle(document.documentElement).getPropertyValue(isDark ? '--chart-color-3' : '--chart-color-3').trim() || (isDark ? '#fbbf24' : '#f59e0b'), 
            federalTax: getComputedStyle(document.documentElement).getPropertyValue('--chart-color-4').trim(), 
            stateTax: getComputedStyle(document.documentElement).getPropertyValue('--color-danger-light').trim(), 
            socialSecurity: getComputedStyle(document.documentElement).getPropertyValue('--color-warning').trim(),
            medicare: getComputedStyle(document.documentElement).getPropertyValue('--color-warning-light').trim(),
            grossPay: getComputedStyle(document.documentElement).getPropertyValue('--chart-color-6').trim() || (isDark ? '#f472b6' : '#ec4899'), 
            textColor: isDark ? '#f9fafb' : '#1f2937',
            gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        };
    }

    function updateCharts(data) {
        const colors = getChartColors();
        const totalTaxes = data.federal + data.state + data.socialSecurity + data.medicare;
        const totalNonNetNonTaxDeductions = data.retirement + data.health + data.hsaFsa + data.otherPretax + data.otherPosttax;

        const chartOptionsBase = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: colors.textColor, font: { family: 'Inter, sans-serif' } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || context.label || '';
                            if (label) label += ': ';
                            const value = context.raw || 0;
                            label += formatCurrency(value, 0);
                            if (context.chart.id === 'income-breakdown-chart' || context.chart.id === 'paycheck-breakdown-chart') {
                                const percent = data.gross > 0 ? (value / data.gross * 100) : 0;
                                label += ` (${formatPercent(percent,1)})`;
                            } else if (context.chart.id === 'tax-distribution-chart') {
                                 const total = context.chart.getDatasetMeta(0).total || totalTaxes; 
                                 const percent = total > 0 ? (value / total * 100) : 0;
                                 label += ` (${formatPercent(percent,1)})`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: { 
                x: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor, display: false } },
                y: { ticks: { color: colors.textColor, callback: (val) => formatCurrency(val,0) }, grid: { color: colors.gridColor } }
            }
        };

        if (incomeBreakdownChart) incomeBreakdownChart.destroy();
        if (taxDistributionChart) taxDistributionChart.destroy();
        if (paycheckBreakdownChart) paycheckBreakdownChart.destroy();
        if (taxBracketsChart) taxBracketsChart.destroy();
        if (netVsGrossChart) netVsGrossChart.destroy();

        incomeBreakdownChart = new Chart(document.getElementById('income-breakdown-chart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Net Income', 'Total Taxes', 'Total Deductions'],
                datasets: [{ data: [data.net, totalTaxes, totalNonNetNonTaxDeductions], backgroundColor: [colors.netIncome, colors.taxes, colors.otherDeductions], borderWidth: 0 }]
            },
            options: {...chartOptionsBase, cutout: '70%'}
        });

        taxDistributionChart = new Chart(document.getElementById('tax-distribution-chart').getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Federal', 'State', 'Social Security', 'Medicare'],
                datasets: [{ data: [data.federal, data.state, data.socialSecurity, data.medicare], backgroundColor: [colors.federalTax, colors.stateTax, colors.socialSecurity, colors.medicare], borderWidth: 0 }]
            },
            options: chartOptionsBase
        });
        
        paycheckBreakdownChart = new Chart(document.getElementById('paycheck-breakdown-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Annual Paycheck'],
                datasets: [
                    { label: 'Net Pay', data: [data.net], backgroundColor: colors.netIncome },
                    { label: 'Federal Tax', data: [data.federal], backgroundColor: colors.federalTax },
                    { label: 'State Tax', data: [data.state], backgroundColor: colors.stateTax },
                    { label: 'Social Security', data: [data.socialSecurity], backgroundColor: colors.socialSecurity },
                    { label: 'Medicare', data: [data.medicare], backgroundColor: colors.medicare },
                    { label: 'Retirement', data: [data.retirement], backgroundColor: colors.retirement },
                    { label: 'Health & Benefits', data: [data.health + data.hsaFsa], backgroundColor: colors.healthAndBenefits },
                    { label: 'Other Deductions', data: [data.otherPretax + data.otherPosttax], backgroundColor: colors.otherDeductions },
                ]
            },
            options: {...chartOptionsBase, scales: {...chartOptionsBase.scales, x: {...chartOptionsBase.scales.x, stacked: true}, y: {...chartOptionsBase.scales.y, stacked: true}}}
        });

        taxBracketsChart = new Chart(document.getElementById('tax-brackets-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.brackets.map(b => `${b.rate}%`),
                datasets: [{ label: 'Tax in Bracket', data: data.brackets.map(b => b.taxAmount), backgroundColor: colors.federalTax }]
            },
            options: {...chartOptionsBase, plugins: {...chartOptionsBase.plugins, tooltip: {...chartOptionsBase.plugins.tooltip, callbacks: {
                ...chartOptionsBase.plugins.tooltip.callbacks,
                title: (tooltipItems) => `Bracket: ${formatCurrency(data.brackets[tooltipItems[0].dataIndex].min,0)} - ${data.brackets[tooltipItems[0].dataIndex].max === Infinity ? 'Up' : formatCurrency(data.brackets[tooltipItems[0].dataIndex].max,0)}`,
                afterLabel: (context) => `Taxable: ${formatCurrency(data.brackets[context.dataIndex].taxableAmount,0)}`
            }}}}
        });

        netVsGrossChart = new Chart(document.getElementById('net-vs-gross-chart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Gross Pay', 'Net Pay'],
                datasets: [{ label: 'Amount', data: [data.gross, data.net], backgroundColor: [colors.grossPay, colors.netIncome] }]
            },
            options: chartOptionsBase
        });
    }
    
    function updateInsights(data, retirementInputPercent) {
        const insightTaxRateEl = document.getElementById('insight-tax-rate');
        const insightRetirementPercentEl = document.getElementById('insight-retirement-percent');
        const insightSavingsAmountEl = document.getElementById('insight-savings-amount');
        const insightEmergencyMonthsEl = document.getElementById('insight-emergency-months');

        if(insightTaxRateEl) insightTaxRateEl.textContent = formatPercent(data.effectiveTaxRate);
        if(insightRetirementPercentEl) insightRetirementPercentEl.textContent = formatPercent(retirementInputPercent); 
        
        const monthlyNet = data.net / 12;
        const recommendedMonthlySavings = monthlyNet * 0.1; 
        const emergencyFundGoal = monthlyNet * 3; 
        const monthsToEmergencyFund = recommendedMonthlySavings > 0 ? Math.ceil(emergencyFundGoal / recommendedMonthlySavings) : "\u221e"; 
        
        if(insightSavingsAmountEl) insightSavingsAmountEl.textContent = formatCurrency(recommendedMonthlySavings);
        if(insightEmergencyMonthsEl) insightEmergencyMonthsEl.textContent = monthsToEmergencyFund;
    }
        
    initTheme();
    if (incomeType) { 
        triggerEvent(incomeType, 'change');
    }
});