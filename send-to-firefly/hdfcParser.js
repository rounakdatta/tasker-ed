const MoneyDirection = {
    DEBIT: -1,
    CREDIT: 1
}
Object.freeze(MoneyDirection)

function getMoneyDirection(payload) {
    let debitRegex = /(?:(?:debited))/;
    let creditRegex = /(?:(?:credited|deposited))/;

    if (debitRegex.test(payload)) {
        return MoneyDirection.DEBIT;
    } else if (creditRegex.test(payload)) {
        return MoneyDirection.CREDIT;
    }

    return null
}

function constructPayloadJson(type, date, amount, notes) {
    let boilerplate = `
    {
        "transactions": [
            {
                "type": "withdrawal",
                "date": "2020-04-19",
                "amount": "1",
                "description": "",
                "source_id": -1,
                "source_name": "",
                "destination_id": 6,
                "destination_name": "(no name)",
                "category_name": "Food",
                "interest_date": "",
                "book_date": "",
                "process_date": "",
                "due_date": "",
                "payment_date": "",
                "invoice_date": "",
                "internal_reference": "",
                "notes": ""
            }
        ]
    }`;

    let source_id = 12;
    let source_name = "HDFC Bank";
    let description = notes;

    let jsonObject = JSON.parse(boilerplate);
    jsonObject.transactions[0].type = type;
    jsonObject.transactions[0].date = date;
    jsonObject.transactions[0].amount = amount;
    jsonObject.transactions[0].description = description;
    jsonObject.transactions[0].source_id = source_id;
    jsonObject.transactions[0].source_name = source_name;
    jsonObject.transactions[0].notes = notes;

    return JSON.stringify(jsonObject)
}

class Debit {
    constructor(smsText) {
        this.smsText = smsText;
        this.transaction = "withdrawal";
    }

    getAmount() {
        let amountRegex = /(?:(?:RS|Rs|INR|MRP)\.?\s?)(\d+(:?\,\d+)?(\,\d+)?(\.\d{1,2})?)/;
        return this.smsText.match(amountRegex)[1];
    }

    getTransactionDate() {
        let dateRegex = /(?:(?:on)\.?\s?)(\d+?-(\d+?|\w{3})-\d+)/
        return this.smsText.match(dateRegex)[1];
    }

    getTransactionDescription() {
        let descriptionRegex = /(?:(?:to)\.?\s?)(.+?(?=\.))/
        return this.smsText.match(descriptionRegex)[1]
    }
}

class Credit {
    constructor(smsText) {
        this.smsText = smsText;
        this.transaction = "deposit";
    }

    getAmount() {
        let amountRegex = /(?:(?:RS|Rs|INR|MRP)\.?\s?)(\d+(:?\,\d+)?(\,\d+)?(\.\d{1,2})?)/;
        return this.smsText.match(amountRegex)[1];
    }

    getTransactionDate() {
        let dateRegex = /(?:(?:on)\.?\s?)(\d+?-(\d+?|\w{3})-\d+)/
        return this.smsText.match(dateRegex)[1];
    }

    getTransactionDescription() {
        let descriptionRegex = /(?:(?:to\ [^a|A]|for)\s?)(.+?(?=\.$))/
        return this.smsText.match(descriptionRegex)[1]
    }
}

var sms = "Rs. 101.00 credited to a/c XXXXXX1234 on 08-02-20 by a/c linked to VPA 9999@apl (UPI Ref No  1234)."
var transactionObject = null

if (getMoneyDirection(sms) == MoneyDirection.DEBIT) {
    transactionObject = new Debit(sms)
} else if (getMoneyDirection(sms) == MoneyDirection.CREDIT) {
    transactionObject = new Credit(sms)
}

var transactionType = transactionObject.transaction;
var transactionDate = transactionObject.getTransactionDate();
var transactionAmount = transactionObject.getAmount();
var transactionNotes = transactionObject.getTransactionDescription();

var payloadJson = constructPayloadJson(transactionType, transactionDate, transactionAmount, transactionNotes);
