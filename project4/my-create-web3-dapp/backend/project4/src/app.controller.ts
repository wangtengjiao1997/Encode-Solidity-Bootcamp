import { Controller, Get, Param, Post, Query, Body, ForbiddenException } from '@nestjs/common';
import { AppService } from './app.service';
import { requestTokenDto } from 'dtos/requestToken.dto';
import { delegateDto } from 'dtos/delegate.dto';
import { voteDto } from 'dtos/vote.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return "hellow worlddd!";
  }

  @Get('last-block')
  getLastBlock(){
    return this.appService.getLastBlock();
  }

  @Get('contract-address')
  getContractAddress(){
    return this.appService.getAddress();
  }

  @Get('total-supply')
  getTotalSupply(){
    return this.appService.getTotalSupply();
  }

  @Get('balance/:address')
  getBalance(@Param('address') address:string){
    return this.appService.getBalance(address); 
  }

  @Get('receipt')
  async getReceipt(@Query('hash') hash:string){
    return await this.appService.getReceipt(hash); 
  }
  @Post('request-tokens')
  requestTokens(@Body() body: requestTokenDto){
    //if (!this.appService.checkSig(body.address,body.signature)) throw new ForbiddenException();
    return this.appService.requestTokens(body.address);
  }

  @Get('BTCprice')
  async getprice(){
    return await this.appService.getBTCprice(); 
  }

  @Post('delegate')
  async delegate(@Body() body: delegateDto){
    return await this.appService.delegate(body.address); 
  }
  
  @Post('vote')
  async vote(@Body() body: voteDto){
    return await this.appService.vote(body.address,body.proposal, body.votes); 
  }
  @Get('result')
  async getResult(){
    return await this.appService.getResult(); 
  }
}
