

export interface RegisteredCommand {
    name: string, // name of command. ex: "help"
    action: (...args: any) => any // function to be excecuted when command is triggered
}