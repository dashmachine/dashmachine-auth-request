const AuthRequest = require('./lib/auth-request');
const Options = require('./options');




const authRequest = new AuthRequest(
  1,
  'salvemio',
  '1234',
  'alice',
  'erosion chalk panda one embrace absurd punch fitness congress cave true fine',
  'Web dApp Sample',
  Options.options,
  'Tweets are greets',
);
/*
authRequest.vendor = {
  name: 'alice',
  id: 'Aobc5KKaA4ZqzP7unc6WawQXQEK2S3y6EwrmvJLLn1ui',
  identityId: 'CheZBPQHztvLNqN67i4KxcTU1XmDz7qG85X1XeJbc7K5',
  identity: {
    id: 'CheZBPQHztvLNqN67i4KxcTU1XmDz7qG85X1XeJbc7K5',
    publicKeys: [
      {
        id: 0,
        type: 0,
        data: 'A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz',
        isEnabled: true,
      },
    ],
    balance: 9686447,
  },
  publicKey: 'A0/qSE6tis4l6BtQlTXB2PHW+WV+Iy0rpF5hAvX8hDRz',
  privateKey:
    '40148175614f062fb0b4e5c519be7b6f57b872ebb55ea719376322fd12547bff',
};

*/

async function test1() {
  try {


    let createdDoc,
      submittedDoc,
      mockResponse,
      foundResponses,
      verifiedRequest;
    try {
      createdDoc = await authRequest.create();
      console.log(`createdDoc:${JSON.stringify(createdDoc)}`);
    } catch (e) {
      console.log(`createdDoc ERROR:${e}`);
    }
    if (createdDoc.success) {
      try {
        submittedDoc = await authRequest.submit();
        console.log(`submittedDoc:${JSON.stringify(submittedDoc)}`);
      } catch (e) {
        console.log(`submittedDoc ERROR:${e}`);
      }
    }

    if (submittedDoc.success) {
      try {
        authRequest.test_enduserMnemonic =
          'liar fee island situate deal exotic flat direct save bag fiscal news';
        authRequest.test_enduserPrivateKey =
          '219c8a8f9376750cee9f06e0409718f2a1b88df4acc61bf9ed9cf252c8602768';
        mockResponse = await authRequest.mockReponse();
        console.log(`mockResponse:${JSON.stringify(mockResponse)}`);
      } catch (e) {
        console.log(`mockResponse ERROR:${e}`);
      }
    }
    if (mockResponse.success) {
      try {
        foundResponses = await authRequest.findResponses();
        console.log(
          `foundResponses:${JSON.stringify(foundResponses)}`,
        );
      } catch (e) {
        console.log(`foundResponses ERROR:${e}`);
      }
    }
    if (foundResponses.success) {
      try {
        verifiedRequest = await authRequest.verify();
        console.log(
          `verifiedRequest:${JSON.stringify(verifiedRequest)}`,
        );
      } catch (e) {
        console.log(`verifiedRequest ERROR:${e}`);
      }
    }
  } catch (e) {
    console.log(`errors: ${e.message}`); /////
  }
}


async function test2() {
  try {
    await authRequest.connect();
    let enduser = authRequest.enduser;
    console.log('intial value:', enduser);
     enduser = authRequest.enduserToJSON;
    console.log('intial value toJSON (error):', enduser);

    enduser = await authRequest.findEnduser();
    console.log('found value:', enduser);
    enduser = await authRequest.findEnduser();
    console.log('shouldnt go to network this time:', enduser);


  } catch (e) {
    console.log(`errors: ${e.message}`); ////
  }
  finally{
    await authRequest.disconnect();
  }
}


async function test3() {
  try {
    await authRequest.connect();
    let vendor = authRequest.vendor;
    console.log('intial value:', vendor);
    vendor = authRequest.vendorToJSON;
    console.log('intial value toJSON (error):', vendor);

    vendor = await authRequest.findVendor();
    console.log('found value:', vendor);
    vendor = await authRequest.findVendor();
    console.log('shouldnt go to network this time:', vendor);


  } catch (e) {
    console.log(`errors: ${e.message}`); ////
  }
  finally{
    await authRequest.disconnect();
  }
}

(async ()=>{
await test3()
})();


