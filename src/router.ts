//helps in routing
//routing helps in capturing the routes and thus it works.
import { OmegaComponent, State } from "@indivice/omega-lang/index"

export const Router = {

    //implements a state-based routing technique. The router takes a state, a target and components to show.
    virtual({ router, routes }:
        {
            router: State<string>, routes: {
                target: string,
                root: () => OmegaComponent
            }[]

        }) {

            

    },

    //uses real browser router index to determine the next route
    native() {

    }

}