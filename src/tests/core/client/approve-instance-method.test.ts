import { BitskiProvider, buildGatewayConfig, NetworkKind } from '@0xcert/ethereum-bitski-backend-provider';
import { ValueLedger } from '@0xcert/ethereum-value-ledger';
import { Spec } from '@specron/spec';
import { Client } from '../../../core/client';
import { AssetApproveData, Priority } from '../../../core/types';

const spec = new Spec<{
  provider: any;
}>();

spec.before(async (stage) => {
  const provider = new BitskiProvider({
    clientId: '11ae8fda-fb79-4051-99bf-be40720ceda5',
    network: 'rinkeby',
    credentialsId: 'f9c69e61-8b76-4ee7-9ba4-cc1d8863a4fa',
    credentialsSecret: '86oQDgZG42IAJD6BhfNAlPLE5VPNzU_VhfmGJy9q_38udgmFWgmC9LBAmJZDa0NjT',
    accountId: '0x3ec11ed12a65fefcef42a53473dd1eec36b8303e',
    requiredConfirmations: 0,
    gatewayConfig: buildGatewayConfig(NetworkKind.RINKEBY),
  });

  stage.set('provider', provider);
});

spec.only('test deploy perform with mock data', async (ctx) => {
  const provider = ctx.get('provider');

  // const vl = new ValueLedger(provider, '0x6C035C66791a19f7Ed7961EC9CFB68A1e5052742');
  // const mutation = await vl.approveValue('1000000000000000000000', '0x929622a1F945f6908E50Ee3e671C79A043774425');
  // console.log(mutation.id);
  // await mutation.complete();

  const client = new Client({
    apiUrl: 'https://api-rinkeby.0xcert.org',
    provider,
  });

  await client.init();

  const approve: AssetApproveData = {
    ledgerId: '0x929622a1F945f6908E50Ee3e671C79A043774425',
    receiverId: '0xF9196F9f176fd2eF9243E8960817d5FbE63D79aa',
    approve: true,
  };
  try {
   // const data = await client.createApproval(approve, Priority.LOW);
   // console.log(JSON.stringify(data));

    const data2 = await client.getApproval('5e5fb8a27dc38b0007b6a3c7');
    console.log(JSON.stringify(data2));
  } catch (e) {
    console.log(JSON.stringify(e));
  }

});

export default spec;
