A quick and dirty utility that uses zeroconf (Bonjour) to advertise a its host machine 
on the network and receive such advertisements. It also modifies `/etc/hosts` accordingly,
so that machines are automatically accessible by the hostname provided from any member running
that script.

## Usage

```bash
$ aneth start <hostname> [--service <serviceName>] [--watch]
```

You can provide a `serviceName` parameter that will be used to listen for advertisements. 
Otherwise, `aneth-hosts` will be used.

The `--watch` options tells Aneth to watch for advertised hosts on the network and modify
`/etc/hosts` accordingly (you'll need to execute that with `sudo` for it to work).

```bash
$ aneth install <hostname> [--service <serviceName>] [--watch]
```

This will install Aneth so it is started on each system reboots, with the provided configurations. Currently, only Mac OS X is supported, simply using a [launchd.plist(5)][1]. I know it should work pretty easily on Linux too, but I'm no expert enough to provide a proper, portable solution. Currently, I'm simply creating a dead-simple [runit][2] setup. I'm kinda lazy, I know. You are very welcome to fork and submit a patch that would include generating and installing a generic init script (or anything really).

## Installation

You will need to install globally if you want the `aneth` executable accessible anywhere.

```bash
$ npm install -g aneth
```

On Mac, it will just work. On linux machine, you need to install a [Bonjour
compatibility library](https://github.com/agnat/node_mdns#installation).

Enjoy.

## License

http://wtfpl.org

[1]: http://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
[2]: http://smarden.org/runit/