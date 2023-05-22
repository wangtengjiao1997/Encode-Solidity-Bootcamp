import { ApiProperty } from "@nestjs/swagger";

export class delegateDto{
    @ApiProperty()
    readonly address: string;
}