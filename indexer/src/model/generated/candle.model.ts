import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
import {CandleResolution} from "./_candleResolution"

@Entity_()
export class Candle {
    constructor(props?: Partial<Candle>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    ticker!: string

    @Index_()
    @Column_("varchar", {length: 3, nullable: false})
    resolution!: CandleResolution

    @Index_()
    @BigIntColumn_({nullable: false})
    startedAt!: bigint

    @StringColumn_({nullable: false})
    open!: string

    @StringColumn_({nullable: false})
    close!: string

    @StringColumn_({nullable: false})
    high!: string

    @StringColumn_({nullable: false})
    low!: string

    @StringColumn_({nullable: true})
    volume!: string | undefined | null

    @IntColumn_({nullable: true})
    trades!: number | undefined | null
}
