import { ApiProperty } from "@nestjs/swagger";

export class requestTokenDto{
    @ApiProperty()
    readonly address: string;
    @ApiProperty()
    readonly signature: string;

}