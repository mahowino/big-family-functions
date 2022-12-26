/* eslint-disable comma-spacing */
/* eslint-disable new-cap */
/* eslint-disable no-trailing-spaces */
/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable camelcase */
/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilioSID="ACca91df146ff9697397ea141016ac1f20";
const twilioAuth="9420d90485ad7bf5fb5e6debccf6ccb3";
const twilio = require('twilio');
const client=new twilio(twilioSID,twilioAuth);

admin.initializeApp(functions.config.firestore);
const db = admin.firestore();


exports.notificationTrigger=functions.firestore.document("/vouchers/{voucher_id}")
    .onCreate( async (snap, context)=>{
      // const id=context.params.voucher_id;
      const sender=snap.get("sender");
      const receiver=snap.get("receiver");
      // const message=",mw";
      // const citiesRef = db.collection('/vouchers/'+id+'/goods/');
      // const snapshot = await citiesRef.get();
      // eslint-disable-next-line arrow-parens
      // snapshot.forEach(doc => {
      //  message+=","+doc.get('good_variant_name')+" : "+doc.get("numberInCart")+"items";
      // });
      client.messages
          .create({
            body: 'You have received goods from '+sender+'containing code to withdraw is +id', 
            from: "+13854693409",
            to: receiver,
          })
      // eslint-disable-next-line arrow-parens
          .then(message => console.log(message.sid));
    });

// mpesa callback code
exports.callbackUrl = functions.https.onRequest(async (request, response)=> {
  console.log("Callback received.");
  const uid = request.query.userid;
  console.log("the usid is " + uid);

  let date = undefined;
  let amount = undefined;
  let receipt = undefined;
  let number = undefined;
  // eslint-disable-next-line camelcase
  const amount_in_wallet=0;
  const callbackData = request.body.Body.stkCallback;

  if (callbackData.ResultCode === 0) {
  // set the transaction details to the database users/userId/mpesaTransactions


    callbackData.CallbackMetadata.Item.forEach((element) => {
      switch (element.Name) {
        case "Amount":
          amount = element.Value;
          console.log("amount is" + element.Value);
          break;
        case "MpesaReceiptNumber":
          receipt = element.Value;
          console.log("receipt is" + element.Value);
          break;
        case "TransactionDate":
          date = element.Value;
          console.log("date is" + element.Value);
          break;
        case "PhoneNumber":
          number = element.Value;
          console.log("number is" + element.Value);
          break;
      }
    });
    // get data first on amount in database.
    // update mpesa transactions.

    const data = {
      receiptMpesa: receipt,
      phoneNumber: number,
      TransactionDate: date,
      cash: amount,
      ResultCode: request.body.Body.stkCallback.ResultCode,
    };
    // create document for goods.
    await db.collection("customers").doc(uid).collection("transactions").add(data);
    const newNotification={
      message: "you have successfully topped up ksh"+amount+" /=, new ballance is"+amount_in_wallet,
      title: "Top up succesfully done",
      type: 1,
    };

    await db.collection("customers").doc(uid).collection("transaction_messages").add(newNotification);
    // eslint-disable-next-line max-len
    console.log("succesfull transaction");
  }
});
