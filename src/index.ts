import { OmegaComponent } from "../node_modules/@indivice/omega-lang/index"
import { NativeComponentIndex } from "../node_modules/@indivice/omega-lang/type"

export class OmegaWebDriver {

    selector: string
    app: () => OmegaComponent

    constructor(selector: string, app: () => OmegaComponent) {

        this.selector = selector
        this.app = app

    }

    __handle_component_property(element: HTMLElement, component: OmegaComponent) {

        if ( component.properties != undefined ) {

            Object.entries(component.properties)
                .forEach( property => {

                    if ( property[0] == "style" ) {

                        if ( property[1] != undefined ) {
                            Object.assign(element.style, property[1])
                        }
                        
                    }

                    if ( property[0].startsWith('on') ) {

                        element.addEventListener(property[0].replace('on', ''), property[1])

                    }

                    element.setAttribute(property[0], property[1])

                })

        }

    }

    __handle_component_children(element: HTMLElement, component: OmegaComponent) {

        if (component.properties != undefined) {

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

            //the layout components
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
                element = document.createElement("input")

                this.__handle_component_property(element, component)

                element.setAttribute('type', 'textarea')

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
        const applicationSelector = document.querySelector(this.selector)

        applicationSelector.appendChild(
            this.__component_builder(buildContext)
        )

    }

}