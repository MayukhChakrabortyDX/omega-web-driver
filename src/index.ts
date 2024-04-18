import { Dynamic, OmegaComponent } from "@indivice/omega-lang/index"
import { NativeComponentIndex } from "@indivice/omega-lang/type"

//create a secure hash to make sure that
//the application components are easily identificable

export class OmegaWebDriver {

    selector: string
    app: () => OmegaComponent

    constructor(selector: string, app: () => OmegaComponent) {

        this.selector = selector
        this.app = app

    }

    __dynamic_tree_builder(preTree: OmegaComponent, newTree: OmegaComponent, node: HTMLElement) {

        //the last thing remains. This is where the magic happens. Ofcourse
        //it works in a very simple principle - compare only the root nodes. that's it
        //this only compare children and nothing else.

        if (preTree.name != newTree.name) {

            //meaning the main node of comparison is already not in our scope of update
            const newNode = this.__component_builder(newTree)
            node.replaceWith(newNode)
            return newNode

        }

        //by the way, if the nodes are text and some native ones, we
        //can get around them pretty easily

        if (newTree.name == NativeComponentIndex.__text__) {

            if (preTree.properties.__driver__.__text__.text != newTree.properties.__driver__.__text__.text) {

                //the node must be none other than a text node
                node.replaceWith(
                    document.createTextNode(newTree.properties.__driver__.__text__.text)
                )

            }

            return node

        }

        if (newTree.name == NativeComponentIndex.HorizontalRule || newTree.name == NativeComponentIndex.BreakLine || newTree.name == NativeComponentIndex.__empty__) {

            return node //their children are not comparable.

        }


        //we need to be able to compare the properties, and adjust them accordingly.
        //each property can hold a dynamic function, so we need to handle two separate cases

        //case 1 -> for classical properties, their objects might remain same. our objective
        //is to find the difference and assign them the new properties.

        //case 2 -> for style, if it is a function, we will not bother, just check it and go
        //but if it is raw styling, we will indeed bother and that's it

        if (newTree.properties != undefined && preTree.properties != undefined) {


            //fairly easy to compare now
            const propertyMatchingMap = new Map(
                Object.keys(preTree.properties).map((v) => [v, false])
            )

            Object.keys(newTree.properties)
                .forEach(property => {

                    propertyMatchingMap.set(property, true)

                })

            //we will assign everything, and a "clean" styling too!
            //now what left to be done is simply easy
            propertyMatchingMap.forEach(
                (isCommon, propertyName) => {

                    if (propertyName != "child" && propertyName != "children") {
                        if (isCommon == false) {

                            if (propertyName.startsWith('on')) {

                                node.removeEventListener(propertyName, preTree.properties[propertyName])

                            } else {

                                node.removeAttribute(propertyName)

                            }

                        } else {

                            //regions does not support any property tag implicitly. Make sure all the components
                            //are free from any dynamic property construct

                            if (propertyName == "style") {

                                if (newTree.properties.style != undefined) {

                                    Object.assign(node.style, newTree.properties.style)

                                }

                                if (preTree.properties.style != undefined) {

                                    Object.keys(preTree.properties.style).forEach(key => {

                                        if (newTree.properties.style[key] == undefined) {

                                            node.style.removeProperty(key)

                                        }

                                    })

                                }

                            } else {

                                if (preTree.properties[propertyName] !== newTree.properties[propertyName]) {

                                    if (!propertyName.startsWith('on')) {
                                        node[propertyName] = newTree.properties[propertyName]
                                        node.setAttribute(propertyName, newTree.properties[propertyName])
                                    } else {
                                        node.addEventListener(propertyName, newTree.properties[propertyName])
                                    }

                                }

                            }

                        }

                    }

                }
            )

        } else if (preTree.properties == undefined && newTree.properties != undefined) {

            //we just need to add those sweet properties.
            this.__handle_component_property(node, newTree)

        } else if (preTree.properties != undefined && newTree.properties == undefined) {

            //it's just better to re-build the entire thing if it all
            //boils down to this
            const newNode = this.__component_builder(newTree)
            node.replaceWith(newNode)
            return newNode

        }

        //we need to understand the following cases:

        //by the way, check for property mismatches and fix that as well here:

        //because region fixes everything :)

        //now we are short-circuiting. Hence we will compare the children now.
        //since the root component is what it is supposed to be,
        //now compare the children one by one.

        //we will only update those children, that contains different children
        //ofcourse we will not update those that does not.

        //give priority to single child first
        if (preTree.properties != undefined && newTree.properties != undefined) {

            //check for the properties as well

            if (preTree.properties.child != undefined && newTree.properties.child != undefined) {

                //compare them, of course
                //@ts-ignore
                this.__dynamic_tree_builder(preTree.properties.child, newTree.properties.child, node.childNodes[0])

            } else if (preTree.properties.child == undefined && newTree.properties.child != undefined) {

                //in that case, we need to just add the child
                node.appendChild(
                    this.__component_builder(newTree.properties.child)
                )

            } else if (preTree.properties.child != undefined && newTree.properties.child == undefined) {

                //in that case, we need to just remove the child
                node.childNodes[0].remove()

            }

            //otherwise do nothing. There is nothing to be done

            //now let us focus if the children themselves exits, because now we are going in the teritorry of
            //advanced comparison

            //we can identify the types of operation: if preTree > newTree (deletion), if ( preTree < newTree (addition) )
            //but first we will deal with trivial cases
            if (preTree.properties.children == undefined && newTree.properties.children != undefined) {

                //just add those children
                newTree.properties.children.forEach(child => {

                    node.appendChild(
                        this.__component_builder(child)
                    )

                })

            } else if (preTree.properties.children != undefined && newTree.properties.children == undefined) {

                //just remove those children
                node.childNodes.forEach(child => child.remove())

            } else if (preTree.properties.children != undefined && newTree.properties.children != undefined) {

                //compare from the new tree once, then the pre tree giving us a 2n advantage overall
                newTree.properties.children.forEach((child, index) => {

                    if (preTree.properties.children[index] != undefined) {

                        //@ts-ignore
                        this.__dynamic_tree_builder(preTree.properties.children[index], child, node.childNodes[index])

                    } else {

                        node.appendChild(
                            this.__component_builder(child)
                        )

                    }

                })

                //now bottom-top approach simillarly for the same application, except we will check for deletion now
                preTree.properties.children.forEach((child, index) => {

                    if (newTree.properties.children[index] == undefined) {

                        //remove those children
                        node.childNodes[index].remove()

                    }

                })

            }

            //ofcourse, our edge case of both undefined really does not do anything at all.

        } else if (preTree.properties != undefined && newTree.properties == undefined) {
            //that just means we need to just replace the node. It is just as
            //good as node replacement.
            const newNode = this.__component_builder(newTree)
            node.replaceWith(newNode)
            return newNode

        } else if (preTree.properties == undefined && newTree.properties != undefined) {

            const newNode = this.__component_builder(newTree)
            node.replaceWith(newNode)
            return newNode

        }

        //edge cases not applicable from the start which is very obvious.


        //if both are undefined, there is nothing for us to do in this. We are practically done. But I have fear about this
        //I do not know how it will turn out. 

        return node

    }

    __handle_dynamic_components(component: Dynamic<OmegaComponent>) {

        //a dynamic component is characterized by the fact that it is dynmaic in the context class

        //these are the trackers that helps in building the foundations. Trackers are comments hence are very
        //well optimized for browser usage

        let initTree = component.dynamic.callback()
        let node = this.__component_builder(initTree)

        component.dynamic.states.forEach(state => {

            state.onchange(() => {

                const newTree = component.dynamic.callback() //get the new tree
                node = this.__dynamic_tree_builder(initTree, newTree, node)
                initTree = newTree

            })

        }) //all the magic happens here

        return node

    }

    __handle_component_property(element: HTMLElement, component: OmegaComponent) {

        if (component.properties != undefined) {

            Object.entries(component.properties)
                .forEach(property => {

                    if (property[1] != "__omega__ignore__property__") {

                        if (property[0] == "style") {

                            if (property[1] != undefined) {

                                if (property[1].name != undefined) {

                                    //meaning it itself is a dynamic stateful property
                                    let track = property[1].dynamic.callback()
                                    //now we will actually optimize this one. Using what we call maps.
                                    //track has bunch of properties we need to compare.
                                    Object.entries(track).forEach(style => {

                                        if (typeof (style[1]) != "string") {

                                            //@ts-ignore                                        
                                            const dynamicProperty: Dynamic<string> = style[1]

                                            let track = dynamicProperty.dynamic.callback()

                                            if (track != "__omega__ignore__property__") {
                                                element.style[style[0]] = track
                                            }

                                            dynamicProperty.dynamic.states.forEach(state => {

                                                state.onchange(() => {

                                                    const newProp = dynamicProperty.dynamic.callback()
                                                    if (newProp != track) {

                                                        element.style[style[0]] = newProp
                                                        track = newProp

                                                    }

                                                })

                                            })

                                        } else {

                                            if (style[1] != "__omega__ignore__property__") {
                                                element.style[style[0]] = style[1]
                                            }

                                        }

                                    })

                                    property[1].dynamic.states.forEach(state => {

                                        state.onchange(() => {

                                            let newTrack = property[1].dynamic.callback()
                                            const styleMap = new Map(
                                                Object.keys(track).map(v => [v, false]) //assume false
                                            )

                                            Object.keys(newTrack).forEach(key => {

                                                styleMap.set(key, true) //will give us the new key tree

                                            })

                                            //now iterate over all the keys, and those that does not exists are to be removed.

                                            styleMap.forEach((v, k) => {

                                                if (v == false) {

                                                    //remove it
                                                    element.style.removeProperty(k)

                                                } else {

                                                    //now those, which are to be compare
                                                    if (track[k] != newTrack[k]) {

                                                        if (typeof (newTrack[k]) != "string" /**could be property dynamics */) {

                                                            throw `Invalid style type: ${typeof (newTrack[k])}`

                                                        } else {

                                                            element.style[k] = newTrack[k]

                                                        }

                                                    }

                                                }

                                            })

                                            track = newTrack

                                        })

                                    })

                                    //now we will compare it with the new map

                                } else {

                                    Object.entries(property[1]).forEach(style => {

                                        if (typeof (style[1]) != "string") {

                                            //@ts-ignore                                        
                                            const dynamicProperty: Dynamic<string> = style[1]

                                            let track = dynamicProperty.dynamic.callback()

                                            if (track != "__omega__ignore__property__") {
                                                element.style[style[0]] = track
                                            }

                                            dynamicProperty.dynamic.states.forEach(state => {

                                                state.onchange(() => {

                                                    const newProp = dynamicProperty.dynamic.callback()
                                                    if (newProp != track) {

                                                        element.style[style[0]] = newProp
                                                        track = newProp

                                                    }

                                                })

                                            })

                                        } else {

                                            if (style[1] != "__omega__ignore__property__") {
                                                element.style[style[0]] = style[1]
                                            }

                                        }

                                    })

                                }

                            }

                        }

                        else if (property[0].startsWith('on')) {

                            element.addEventListener(property[0].replace('on', ''), property[1])

                        } else if ( property[0] == "reference" ) {

                            //property[1] must be a state
                            property[1].set( element )

                        }

                        else if (property[0] != "child" && property[0] != "children" && !property[0].startsWith('on') && property[0] != "style") {

                            if (typeof (property[1]) != "string") {

                                //it must be a dynamic one.
                                const dynamicProperty: Dynamic<string> = property[1]

                                let track = dynamicProperty.dynamic.callback()

                                if (track != "__omega__ignore__property__") {
                                    element[property[0]] = track
                                    element.setAttribute(property[0], track)
                                }

                                dynamicProperty.dynamic.states.forEach(state => {

                                    state.onchange(() => {

                                        const newProp = dynamicProperty.dynamic.callback()
                                        if (newProp !== track) {

                                            element[property[0]] = newProp
                                            element.setAttribute(property[0], newProp)
                                            track = newProp

                                        }

                                    })

                                })

                            } else {

                                if (property[1] != "__omega__ignore__property__") {
                                    element[property[0]] = property[1]
                                    element.setAttribute(property[0], property[1])
                                }

                            }

                        }

                    }

                })

        }

    }

    __handle_component_children(element: HTMLElement, component: OmegaComponent) {

        if (component.properties != undefined) {

            //priority is given to a single child (I mean that is obvious)
            if (component.properties.child != undefined) {

                element.appendChild(
                    this.__component_builder(component.properties.child)
                )

            }

            else if (component.properties.children != undefined) {

                component.properties.children.forEach(child => {

                    element.appendChild(
                        this.__component_builder(child)
                    )

                })

            }

        }

    }

    __component_builder(component: OmegaComponent) {

        let element: HTMLElement

        switch (component.name) {

            //native processing
            case NativeComponentIndex.__driver__:
                console.warn(`Component __driver__ (Index ${component.name})\ndoes not have any use in context of omegaUI official web driver`)
                return document.createComment("No context __driver__ component")

            case NativeComponentIndex.__dynamic__:

                //now comes the very interesting part. Here, we will do some very clever things
                //to track our dynamic component
                //a dynamic component must return a singular component, that includes fragments as well.

                //@ts-ignore Because if a component is marked as __dynamic__, it was by default formatted correctly by the language utlity functions
                return this.__handle_dynamic_components(component)

            //the layout components
            case NativeComponentIndex.__empty__:
                return document.createComment('EM')

            case NativeComponentIndex.View:
                element = document.createElement("div")

                this.__handle_component_children(element, component)
                this.__handle_component_property(element, component)

                return element

            case NativeComponentIndex.GridView:
                element = document.createElement("div")

                element.style.display = "grid"

                this.__handle_component_children(element, component)
                this.__handle_component_property(element, component)

                return element

            case NativeComponentIndex.RowView:
                element = document.createElement("div")

                element.style.display = "flex"
                element.style.flexDirection = "row"

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.ColumnView:
                element = document.createElement("div")

                element.style.display = "flex"
                element.style.flexDirection = "column"

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element


            //the input components
            case NativeComponentIndex.TextInput:
                element = document.createElement("input")

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'text')

                return element

            case NativeComponentIndex.TextAreaInput:
                element = document.createElement("textarea")

                this.__handle_component_property(element, component)

                return element

            case NativeComponentIndex.Link:
                element = document.createElement('a')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.Button:
                element = document.createElement("button")

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.NumberInput:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'number')

                return element

            case NativeComponentIndex.EmailInput:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'email')

                return element

            case NativeComponentIndex.PasswordInput:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'password')

                return element

            case NativeComponentIndex.FileInput:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'file')

                return element

            case NativeComponentIndex.Checkbox:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'checkbox')

                return element

            case NativeComponentIndex.Dropdown:
                element = document.createElement('select')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.DropdownItem:
                element = document.createElement('option')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.Date:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'date')

                return element

            case NativeComponentIndex.Time:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'time')

                return element


            case NativeComponentIndex.DateTime:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'datetime-local')

                return element

            case NativeComponentIndex.Color:
                element = document.createElement('input')

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'color')

                return element

            //Content based components
            case NativeComponentIndex.__text__:
                const text = document.createTextNode(
                    component.properties.__driver__.__text__.text
                )

                return text

            case NativeComponentIndex.Icon:
                element = document.createElement('i')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.TextBox:
                element = document.createElement('p')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.Label:
                element = document.createElement("label")

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.BreakLine:
                element = document.createElement('br')

                this.__handle_component_property(element, component)

                return element

            case NativeComponentIndex.HorizontalRule:
                element = document.createElement('hr')

                this.__handle_component_property(element, component)

                return element

            //media elements
            case NativeComponentIndex.Audio:
                element = document.createElement('audio')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.Video:
                element = document.createElement('video')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.Image:
                element = document.createElement('img')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.IFrame:
                element = document.createElement("iframe")

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.MultiMedia:
                element = document.createElement('object')

                this.__handle_component_property(element, component)
                this.__handle_component_children(element, component)

                return element

            case NativeComponentIndex.MediaSource:
                element = document.createElement('source')

                this.__handle_component_property(element, component)

                return element

            default:
                throw `Invalid component request [ Unrecognized (Index ${component.name}) ]`

        }

    }

    render() {

        //first, we will figure out the components that are need to be rendered,
        //then assign state features and finally show the entire tree to the output.

        //first try to build the specific component
        const buildContext = this.app()
        const applicationSelector: HTMLElement = document.querySelector(this.selector)

        applicationSelector.appendChild(
            this.__component_builder(buildContext)
        )

    }

}