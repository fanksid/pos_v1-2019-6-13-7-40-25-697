'use strict';

function printReceipt(inputs) {

    var countMap = groupById(inputs)

    var receiptDetailList = getReceiptDetailByIdMap(countMap)

    var receiptSum = getReceiptSumWithDiscount(receiptDetailList)

    console.log(getReceiptSummaryString(receiptSum));
}

function getReceiptSummaryString(receiptSum) {
    return '***<没钱赚商店>收据***\n' +
        getReceiptDetailString(receiptSum) +
        '----------------------\n' +
        '总计：' + toTwoDecimal(receiptSum.sum) + '(元)\n' +
        '节省：' + toTwoDecimal(receiptSum.discount) + '(元)\n' +
        '**********************';
}

function getReceiptDetailString(receiptSum) {
    var result = '';
    receiptSum.detailList.forEach(r => {
        result = result + '名称：' + r.name + '，数量：' + r.count + r.unit + '，单价：' +
            toTwoDecimal(r.price) + '(元)，小计：' +
            toTwoDecimal(r.sum) + '(元)\n';
    });
    return result;
}

function toTwoDecimal(sum) {
    return sum.toFixed(2);
}

function getReceiptSumWithDiscount(receiptDetailList) {
    var receiptSum = {
        detailList: receiptDetailList,
        sum: 0,
        discount: 0
    }

    receiptDetailList.forEach(element => {
        var discountOfReceipt = calculateDiscount(element);
        var cost = element.price * element.count - discountOfReceipt;
        element.sum = cost;
        receiptSum.sum += cost;
        receiptSum.discount += discountOfReceipt;
    });

    return receiptSum
}

function calculateDiscount(receiptDetail) {
    let promotions = loadPromotions();
    var disocunt = 0;

    promotions.forEach(e => {
        console.log(e)
        if (e.barcodes.indexOf(receiptDetail.id) != -1 && e.type == 'BUY_TWO_GET_ONE_FREE' && receiptDetail.count >= 2) {
            disocunt = receiptDetail.price;
        }
    });

    return disocunt;
}

function getReceiptDetailByIdMap(idMap) {
    var productList = loadAllItems();
    var receiptList = [];

    idMap.forEach(function (value, key, map) {
        var product = findProduct(productList, key);
        var receipt = {
            id: product.barcode,
            name: product.name,
            price: product.price,
            count: value,
            unit: product.unit
        }
        receiptList.push(receipt);
    });

    return receiptList;
}

function groupById(params) {
    var countMap = new Map();
    params.forEach(element => {
        var { id, count } = getIdAndCountFromId(element);
        if (countMap.has(id)) {
            count = countMap.get(id) + count;
        }

        countMap.set(id, count)
    });

    return countMap;
}


function getIdAndCountFromId(element) {
    var count = 1;
    var id = element;
    if (element.indexOf('-') != -1) {
        id = element.substring(0, element.indexOf('-'));
        count = element.substring(element.indexOf('-') + 1);
        if (count.indexOf('.') != -1) {
            count = parseFloat(count);
        }
        else {
            count = parseInt(count);
        }
    }

    return { id, count };
}

function findProduct(list, id) {
    for (let index = 0; index < list.length; index++) {
        if (list[index].barcode == id) {
            return list[index];
        }
    }
    return null;
}