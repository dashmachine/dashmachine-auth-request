const AuthRequest = require('./lib/auth-request');
const Options = require('./options');

(async () => {
  try {
    const req = new AuthRequest(
      1,
      'bob',
      '1234',
      'alice',
      'uniform analyst paper father soldier toe lesson fetch exhaust jazz swim response',
      'Web dApp Sample',
      Options.options,
      'Tweets are greets',
    );

    req.vendor = {
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

    let createdDoc,
      submittedDoc,
      mockResponse,
      foundResponses,
      verifiedRequest;
    try {
      createdDoc = await req.create();
      console.log(`createdDoc:${JSON.stringify(createdDoc)}`);
    } catch (e) {
      console.log(`createdDoc ERROR:${e}`);
    }
    if (createdDoc.success) {
      try {
        submittedDoc = await req.submit();
        console.log(`submittedDoc:${JSON.stringify(submittedDoc)}`);
      } catch (e) {
        console.log(`submittedDoc ERROR:${e}`);
      }
    }

    if (submittedDoc.success) {
      try {
        req.test_enduserMnemonic =
          'liar fee island situate deal exotic flat direct save bag fiscal news';
        req.test_enduserPrivateKey =
          '219c8a8f9376750cee9f06e0409718f2a1b88df4acc61bf9ed9cf252c8602768';
        mockResponse = await req.mockReponse();
        console.log(`mockResponse:${JSON.stringify(mockResponse)}`);
      } catch (e) {
        console.log(`mockResponse ERROR:${e}`);
      }
    }
    if (mockResponse.success) {
      try {
        foundResponses = await req.findResponses();
        console.log(
          `foundResponses:${JSON.stringify(foundResponses)}`,
        );
      } catch (e) {
        console.log(`foundResponses ERROR:${e}`);
      }
    }
    if (foundResponses.success) {
      try {
        verifiedRequest = await req.verify();
        console.log(
          `verifiedRequest:${JSON.stringify(verifiedRequest)}`,
        );
      } catch (e) {
        console.log(`verifiedRequest ERROR:${e}`);
      }
    }
  } catch (e) {
    console.log(`errors: ${e}`); ////
  }
})();
