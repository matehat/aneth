A quick and dirty utility that uses zeroconf (Bonjour) to advertise a its host machine 
on the network and receive such advertisements. It also modifies `/etc/hosts` accordingly,
so that machines are automatically accessible by the hostname provided from any member running
that script.

## Usage

```bash
$ aneth start <hostname> [--service <serviceName>]
$ aneth stop
```

You can provide a `serviceName` parameter that will be used to listen for advertisements. 
Otherwise, `org.aneth.hosts` will be used.

## Installation

```bash
$ npm install aneth
```

On Mac, it will just work. On linux machine, you need to install a [Bonjour
compatibility library](https://github.com/agnat/node_mdns#installation).

Enjoy.

## License

http://wtfpl.org