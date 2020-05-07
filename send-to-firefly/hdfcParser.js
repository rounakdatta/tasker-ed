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

function transformDateFormat(originalDate) {
    let splitDate = originalDate.split("-")
    let alteredDate = new Date([splitDate[1], splitDate[0], splitDate[2]].join("-"))

    let offset = +530;
    alteredDate = new Date(alteredDate.getTime() + (offset*60*1000))
    return alteredDate.toISOString().split('T')[0]
}

function constructPayloadJson(type, date, amount, notes) {
    let boilerplate = `
    {
        "transactions": [
            {
                "type": "withdrawal",
                "date": "",
                "amount": "",
                "description": "",
                "source_id": -1,
                "source_name": "",
                "destination_id": 12,
                "destination_name": "HDFC Bank",
                "category_name": "",
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

    let source_id = 5;
    let source_name = "(no name)";
    let description = notes;

    let jsonObject = JSON.parse(boilerplate);
    jsonObject.transactions[0].type = type;
    jsonObject.transactions[0].date = transformDateFormat(date);
    jsonObject.transactions[0].amount = amount;
    jsonObject.transactions[0].description = description;
    jsonObject.transactions[0].source_id = source_id;
    jsonObject.transactions[0].source_name = source_name;
    jsonObject.transactions[0].notes = notes;

    return JSON.stringify(jsonObject)
}

function postTransaction(data, host, personalAccessToken) {
    console.log(data);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
        console.log(this.responseText);
    }
    });

    xhr.open("POST", host + "/money/api/v1/transactions");
    xhr.setRequestHeader("Connection", "keep-alive");
    xhr.setRequestHeader("Pragma", "no-cache");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Accept", "application/json, text/plain, */*");
    xhr.setRequestHeader("Sec-Fetch-Dest", "empty");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Origin", host);
    xhr.setRequestHeader("Sec-Fetch-Site", "same-origin");
    xhr.setRequestHeader("Sec-Fetch-Mode", "cors");
    xhr.setRequestHeader("Accept-Language", "en-US,en;q=0.9");
    xhr.setRequestHeader("Authorization", "Bearer " + personalAccessToken);
    xhr.setRequestHeader("Content-Type", "text/plain");

    xhr.send(data);
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

var host = global("FireflyHost")
var personalAccessToken = global("FireflyPersonalAccessToken")

var sms = "Rs. 101.00 credited to a/c XXXXXX1234 on 04-05-20 by a/c linked to VPA 9999@apl (UPI Ref No  1234)."
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
postTransaction(payloadJson, host, personalAccessToken);