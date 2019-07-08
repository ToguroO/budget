var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome * 100));
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, description, value) {
            var ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {
                ID = 0;
            }
            var newItem;
            if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (id, type) {
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            var index = ids.indexOf(id);
            console.log(index);
            if (index >= 0) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calculatePercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        },
    };

})();




var UIController = (function () {

    var DOMstrings = {
        inputType: ".add__type",
        descriptionType: ".add__description",
        valueType: ".add__value",
        btnType: ".add__btn",
        incomesContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        monthLabel: ".budget__title--month",
    };

    var formatNumber = function (number, type) {
        number = Math.abs(number);
        number = number.toFixed(2);

        var numSplit = number.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }

        dec = numSplit[1];
        return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;
    };

    var getTypeInput = function () {
        return document.querySelector(DOMstrings.inputType).value; // inc or exp
    };

    var getDescriptionInput = function () {
        return document.querySelector(DOMstrings.descriptionType).value;
    };

    var getValueInput = function () {
        return parseFloat(document.querySelector(DOMstrings.valueType).value);
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function () {
            return {
                type: getTypeInput(),
                description: getDescriptionInput(),
                value: getValueInput()
            };

        },

        addListItem: function (item, type) {
            // Create HTML string with placeholder text
            var html;
            var domElement;
            if (type === 'inc') {
                domElement = DOMstrings.incomesContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                domElement = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the palceolder text with some actual data
            var newHtml = html
                .replace("%id%", item.id)
                .replace("%value%", this.formatNumber(item.value, type))
                .replace("%description%", item.description);

            // Insert the HTML in the DOM
            document.querySelector(domElement).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorId) {
            var item = document.getElementById(selectorId);
            item.parentNode.removeChild(item);
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "--";
                }
            });


        },

        clearFields: function () {
            var fields = document.querySelectorAll(DOMstrings.descriptionType + "," + DOMstrings.valueType);
            var fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: function (budget) {

            var type = budget.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget.budget, type);
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(budget.totalExp, 'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budget.totalInc, 'inc');
            if (budget.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = budget.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayMonth: function () {
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            var now = new Date();
            var month = now.getMonth();
            var year = now.getFullYear();
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + " " + year;
        },

        
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.descriptionType + "," +
                DOMstrings.valueType);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.btnType).classList.toggle('red');

        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();




var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.btnType).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType());
    };

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. Calculate percentage
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update he UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        // 1. Get the field input data
        var input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            var newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 3.5 Clear the fields
            UICtrl.clearFields();

            // 4. Calculate and update the budget
            updateBudget();

            // 5. Calculate and update percentages. 
            updatePercentages();
        }


    };

    var ctrlDeleteItem = function (event) {
        // console.log(event.target.parentNode);
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            // id fomat = inc-0; inc-1 etc..
            var splitId = itemId.split('-');
            var type = splitId[0];
            var id = parseInt(splitId[1]);

            // 1. delete item from the data structure
            budgetCtrl.deleteItem(id, type);

            // 2. delete item from the UI
            UICtrl.deleteListItem(itemId);
            // 3. Update and show the new budget
            updateBudget();

            updatePercentages();
        }
    };

    return {
        init: function () {
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UIController.displayMonth();
            setupEventListeners();
        }
    };


})(budgetController, UIController);

controller.init();