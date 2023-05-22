import { ApiProperty } from "@nestjs/swagger";

export class voteDto{
    @ApiProperty()
    readonly address: string;
    @ApiProperty()
    readonly proposal: number;
    @ApiProperty()
    readonly votes: string;

}