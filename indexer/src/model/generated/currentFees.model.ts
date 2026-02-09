import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class CurrentFees {
    constructor(props?: Partial<CurrentFees>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    liquidityFeeBasisPoints!: number

    @IntColumn_({nullable: false})
    increasePositionFeeBasisPoints!: number

    @IntColumn_({nullable: false})
    decreasePositionFeeBasisPoints!: number

    @IntColumn_({nullable: false})
    liquidationFeeBasisPoints!: number
}
