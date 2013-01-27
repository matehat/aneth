A quick and dirty utility that uses zeroconf (Bonjour) to advertise a its host machine 
on the network and receive such advertisements. It also modifies `/etc/hosts` accordingly,
so that machines are automatically accessible by the hostname provided from any member running
that script.

## Usage

```bash
$ aneth <hostname>
```

## Installation

```bash
$ npm install aneth
```

On Mac, it will just work. On linux machine, you need to install a [Bonjour
compatibility library](https://github.com/agnat/node_mdns#installation).

Enjoy.

## License

http://wtfpl.org