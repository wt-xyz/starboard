import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class CurrentFundingInfo {
    constructor(props?: Partial<CurrentFundingInfo>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    asset!: string

    @IntColumn_({nullable: false})
    timestamp!: number

    @BigIntColumn_({nullable: false})
    totalShortSizes!: bigint

    @BigIntColumn_({nullable: false})
    totalLongSizes!: bigint

    @BigIntColumn_({nullable: false})
    longCumulativeFundingRate!: bigint

    @BigIntColumn_({nullable: false})
    shortCumulativeFundingRate!: bigint
}
