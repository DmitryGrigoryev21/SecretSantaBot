import DiscordJS, { Intents, Interaction } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()

const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES]
})


class Node {
    value: any
    next?: Node
    constructor(value: any)
    constructor(value: any, next?: Node) {
        this.next = undefined;
        this.value = value;
        if(arguments.length > 1) {
            this.next = next;
        }
    }
}

class LinkedList {
    head?: Node
    tail?: Node
    constructor() {
    }

    add(value: any) {
        const n = new Node(value);

        if(!this.head) {
            this.head = n;
            return;
        }

        if(!this.tail) {
            this.head.next = n;
            this.tail = n;
            return;
        }

        this.tail.next = n;
        this.tail = n;
    }

    *[Symbol.iterator] () {
        let c = this.head;
        if(!c) return;
        while(c) {
            yield c;
            c = c.next;
        }
      }
}

const list = new Map();

client.on('ready',  () => {
    console.log('The bot is ready baby')

    const guildId = '909820759755620353'
    const guild = client.guilds.cache.get(guildId)
    let commands

    if (guild){
        commands = guild.commands
    }
    else{
        commands = client.application?.commands
    }

    commands?.create({
        name:'join_draft',
        description: 'join the draft',
    })
    commands?.create({
        name:'leave_draft',
        description: 'leave the draft',
    })
    commands?.create({
        name:'list_all',
        description: 'displays list of all current users in the draft',
    })
    commands?.create({
        name:'draft',
        description: 'will draft all registered users',
    })
    commands?.create({
        name:'reveal',
        description: 'will show you your pick (it will be hidden dw)',
    })
})

client.on('interactionCreate',async(interaction) =>{
    if (!interaction.isCommand()){
        return
    }
    const { commandName, options } = interaction

    if (commandName === 'join_draft'){
        const { username: name, id } = interaction.member.user;

        //const name = options.getString('name')
        list.set(id, name)

        console.log(id, name)

        
        interaction.reply({
            content: `${name} has joined the draft!`,
            //ephemeral: true,
        })
    }
    else if (commandName === 'leave_draft'){
        const { username: name, id } = interaction.member.user;

        //const name = options.getString('name')!
        list.delete(id)

        
        interaction.reply({
            content: `${name} has left the draft!`,
            //ephemeral: true,
        })
    }
    else if (commandName === 'list_all'){
        let list_string = 'Here is everyone in the draft:';
        for(const [id, name] of list) {
            console.log(name)
            list_string += `
            ${name}`
        }
        console.log(list_string)
        interaction.reply({
            content: list_string,
            //ephemeral: true,
        })

    }
    else if (commandName === 'draft'){

        const ll = new LinkedList();
        const vals = Array.from(list);
        vals.sort(() => .5 - Math.random()).forEach(n => ll.add({ id: n[0], name: n[1] }))

        if(!ll.head || !ll.tail) {
            return interaction.reply({content: "No."})
        }
        for(const x of ll) {
            
            if(!x.next)break;

            const v = x?.value;

            list.set(v.id, { name: v.name, got: x?.next?.value })
        }
        
        list.set(ll.tail.value.id, ll.head.value)


        interaction.reply({

            content: "THE DRAFT HAS BEEN MADE",
            //ephemeral: true,
        })

    }
    else if (commandName === 'reveal'){
        const you = list.get(interaction.member.user.id);
        console.log(you)
        interaction.reply({
            content: `You got this dickhead: ${you.got.name}`,
            ephemeral: true
        })
    }
})

client.login(process.env.TOKEN)
