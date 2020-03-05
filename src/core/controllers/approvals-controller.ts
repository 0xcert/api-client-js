import { AssetSetOperatorOrder, Gateway, OrderKind } from '@0xcert/ethereum-gateway';
import BigNumber from 'bignumber.js';
import { URLSearchParams } from 'url';
import { Client } from '../client';
import { ClientError } from '../helpers/client-error';
import clientFetch from '../helpers/client-fetch';
import { AssetApproveData, ClientErrorCode, GetApprovalsOptions, Priority } from '../types';

/**
 * Approvals controller class with approvals related actions.
 */
export class ApprovalsController {

  /**
   * Client's context.
   */
  public context: Client;

  /**
   * Deployments controller class constructor.
   * @param context Client context instance.
   */
  public constructor(context: Client) {
    this.context = context;
  }

  /**
   * Returns paginated list of deployment.
   * @param pagination Listing pagination configuration.
   */
  public async getApprovals(options: GetApprovalsOptions) {
    if (!this.context.authentication) {
      throw new ClientError(ClientErrorCode.CLIENT_NOT_CONNECTION);
    }

    const params = new URLSearchParams({
      ...options.filterIds ? { filterIds: options.filterIds } : {},
      ...options.statuses ? { statuses: options.statuses.map((s) => s.toString()) } : {},
      ...options.sort ? { sort: options.sort.toString() } : {},
      ...options.skip ? { skip: options.skip.toString() } : { skip: this.context.defaultPagination.skip.toString() },
      ...options.limit ? { limit: options.limit.toString() } : { limit: this.context.defaultPagination.limit.toString() },
    });

    return clientFetch(`${this.context.apiUrl}/approvals?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.context.authentication,
      },
    });
  }

  /**
   * Returns single approval data.
   * @param approvalRef Approval reference.
   */
  public async getApproval(approvalRef: string) {
    if (!this.context.authentication) {
      throw new ClientError(ClientErrorCode.CLIENT_NOT_CONNECTION);
    }

    return clientFetch(`${this.context.apiUrl}/approvals/${approvalRef}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.context.authentication,
      },
    });
  }

  /**
   * Creates approve order.
   * @param approvalData Approve data.
   * @param priority Priority for this deploy to perform.
   */
  public async createApproval(approveData: AssetApproveData, priority: Priority) {
    if (!this.context.authentication) {
      throw new ClientError(ClientErrorCode.CLIENT_NOT_CONNECTION);
    }

    const gateway = new Gateway(this.context.provider);
    const date = Date.now();
    const value = new BigNumber(this.context.payment.assetApproveCost);
    const approveOrder = {
      kind: OrderKind.ASSET_SET_OPERATOR_ORDER,
      ledgerId: approveData.ledgerId,
      owner: this.context.provider.accountId,
      operator: approveData.receiverId,
      isOperator: approveData.approve,
      seed: date,
      expiration: Date.now() + 172800000, // 2 days
      tokenTransferData: {
        ledgerId: this.context.payment.tokenAddress,
        receiverId: this.context.payment.receiverAddress,
        value: value.toFixed(0),
      },
    };
    const claim = await gateway.sign(approveOrder as AssetSetOperatorOrder);
    delete approveOrder.kind; // kind will be automatically assigned by the API

    return clientFetch(`${this.context.apiUrl}/approvals`, {
      method: 'POST',
      body: JSON.stringify({
        priority,
        claim,
        approve: approveOrder,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.context.authentication,
      },
    });
  }

}
