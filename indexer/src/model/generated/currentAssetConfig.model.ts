import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class CurrentAssetConfig {
    constructor(props?: Partial<CurrentAssetConfig>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    asset!: string

    @BigIntColumn_({nullable: false})
    maxLeverage!: bigint
}
