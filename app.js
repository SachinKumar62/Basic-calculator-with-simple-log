class Calculator {
    constructor() {
        this.currentExpression = '';
        this.currentResult = '';
        this.lastResult = null;
        this.shouldResetOnNextInput = false;
        this.history = this.loadHistory();

        this.initializeElements();
        this.attachEventListeners();
        this.renderHistory();
        this.updateDisplay();
    }

    initializeElements() {
        this.expressionDisplay = document.getElementById('expression');
        this.resultDisplay = document.getElementById('result');
        this.historyList = document.getElementById('history-list');
        // Buttons
        this.numberButtons = document.querySelectorAll('.number');
        this.operatorButtons = document.querySelectorAll('.operator');
        this.equalsButton = document.getElementById('equals');
        this.clearButton = document.getElementById('clear');
        this.clearAllButton = document.getElementById('clear-all');
        this.decimalButton = document.getElementById('decimal');
        this.clearHistoryButton = document.getElementById('clear-history');
    }

    attachEventListeners() {
        this.numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.inputNumber(button.dataset.number);
            });
        });
        this.operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.inputOperator(button.dataset.operator);
            });
        });
        this.equalsButton.addEventListener('click', () => this.calculate());
        this.clearButton.addEventListener('click', () => this.clear());
        this.clearAllButton.addEventListener('click', () => this.clearAll());
        this.decimalButton.addEventListener('click', () => this.inputDecimal());
        this.clearHistoryButton.addEventListener('click', () => this.clearHistory());
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
        this.historyList.addEventListener('click', e => this.handleHistoryClick(e));
    }

    inputNumber(number) {
        if (this.shouldResetOnNextInput) {
            this.currentExpression = '';
            this.shouldResetOnNextInput = false;
        }
        if (this.currentExpression === '0') this.currentExpression = '';
        this.currentExpression += number;
        this.updateDisplay();
    }

    inputOperator(operator) {
        if (this.shouldResetOnNextInput) this.shouldResetOnNextInput = false;
        if (!this.currentExpression) return;
        let last = this.currentExpression.slice(-1);
        if ("+-*/".includes(last)) {
            this.currentExpression = this.currentExpression.slice(0, -1) + operator;
        } else {
            this.currentExpression += operator;
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.shouldResetOnNextInput) this.shouldResetOnNextInput = false;
        let parts = this.currentExpression.split(/[\+\-\*\/]/);
        let last = parts[parts.length - 1];
        if (last.includes('.')) return;
        this.currentExpression += this.currentExpression === '' ? '0.' : '.';
        this.updateDisplay();
    }

    calculate() {
        try {
            let expr = this.currentExpression;
            if (!expr) return;
            let result = Function('"use strict";return (' + expr.replace(/÷/g, '/').replace(/×/g, '*') + ')')();
            if (result === Infinity || isNaN(result)) {
                this.currentResult = 'Error';
            } else {
                this.currentResult = Number(result.toFixed(10)).toString();
                this.addToHistory(expr, this.currentResult);
            }
            this.shouldResetOnNextInput = true;
        } catch (e) {
            this.currentResult = 'Error';
            this.shouldResetOnNextInput = true;
        }
        this.updateDisplay();
    }

    clear() {
        this.currentExpression = '';
        this.currentResult = '';
        this.updateDisplay();
    }

    clearAll() {
        this.currentExpression = '';
        this.currentResult = '';
        this.updateDisplay();
    }

    handleKeyboardInput(e) {
        if (e.ctrlKey || e.metaKey) return;
        if (e.key >= '0' && e.key <= '9') this.inputNumber(e.key);
        else if ("+-*/".includes(e.key)) this.inputOperator(e.key);
        else if (e.key === '.' || e.key === ',') this.inputDecimal();
        else if (e.key === 'Enter') { e.preventDefault(); this.calculate(); }
        else if (e.key.toLowerCase() === 'c') this.clear();
        else if (e.key === 'Backspace') {
            this.currentExpression = this.currentExpression.slice(0, -1);
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.expressionDisplay.textContent = this.currentExpression === '' ? '0' : this.currentExpression;
        this.resultDisplay.textContent = this.currentResult;
    }

    addToHistory(expression, result) {
        const entry = {
            expression,
            result,
            timestamp: new Date().toLocaleString()
        };
        this.history.unshift(entry);
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = '';
        this.history.forEach((entry, idx) => {
            const li = document.createElement('li');
            li.dataset.idx = idx;
            li.innerHTML = `<span>${entry.expression} = <strong>${entry.result}</strong></span>
            <span class="history-timestamp">${entry.timestamp}</span>`;
            this.historyList.appendChild(li);
        });
    }

    handleHistoryClick(e) {
        const li = e.target.closest('li');
        if (!li) return;
        const idx = +li.dataset.idx;
        if (typeof this.history[idx] !== 'undefined') {
            this.currentExpression = this.history[idx].expression;
            this.currentResult = this.history[idx].result;
            this.shouldResetOnNextInput = true;
            this.updateDisplay();
        }
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        return JSON.parse(localStorage.getItem('calcHistory') || '[]');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
