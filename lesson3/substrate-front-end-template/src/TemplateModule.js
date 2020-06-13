import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import { blake2AsHex } from '@polkadot/util-crypto';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');
  const [blockNumber,setBlockNumber] = useState(0);

  useEffect(() => {
    let unsubscribe;
    api.query.poeModule.proofs(digest,(result)=>{
     setOwner(result[0].toString());
     setBlockNumber(result[1].toNumber());
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [digest,api.query.PoeModule]);

  const handleFileChosen = (file) => {
    let fileReader = new FileReader();

    const bufferToDigest = () =>{
      const content = Array.from(new Uint8Array(fileReader.result))
        .map((b) => b.toString(16).padStart(2,'0'))
        .join('');
      
      const hash = blake2AsHex(content,256);
      setDigest(hash);  
        
    }

    fileReader.onloadend = bufferToDigest;

    fileReader.readAsArrayBuffer(file);

  }

  return (
    <Grid.Column width={8}>
      <h1>Proof of Existence Module</h1>
      <Form>
        <form.Field>
          <Input
          type='file'
          id ='file'
          label='Your File'
          onChange={(e) => handleFileChosen(e.target.files(0))}
          />
        </form.Field>

        <form.Field>
          <TxButton
            accountPair={accountPair}
            label='Create Claim'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'poeModule',
              callable: 'createClaim',
              inputParams: [digest],
              paramFields: [true]
            }}
          />  

          <TxButton
             accountPair={accountPair}
             label='Revoke claim'
             setStatus={setStatus}
             type='SIGNED-TX'
             attrs={{
               palletRpc: 'poeModule',
               callable: 'invokeClaim',
               inputParams: [digest],
               paramFields: [true]
             }}
            /> 
        </form.Field>

      <div>{status}</div>
      <div>{'Claim info, owner: ${owner},BlockNumber:${BlockNumber}'}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PoeModule (props) {
  const { api } = useSubstrate();
  return (api.query.PoeModule && api.query.PoeeModule.proofs
    ? <Main {...props} /> : null);
}
