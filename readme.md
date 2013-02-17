A quick and dirty utility that uses Zeroconf to advertize its host machine with a specified hostname
on the network. It can also listen for these advertisements and manage `/etc/hosts` accordingly,
so that machines are automatically accessible by their provided hostname from any member running
that script.

## What's the point?

If you're the kind of person that needs to manage multiple machines and VMs in a safe network, you might have come across 
the annoyance of referring to them on the network (getting their IP address and so on). Wouldn't it be nice if 
those machines just had simple names like `a.dev.local`, `b.dev.local`, `c.dev.local` and so on. Open a terminal, 
install **Aneth**, start it and *BOOM*, all the other machines will be able to refer to it using the name you want.
No playing with DHCP, UNIX hostnames, DNS or what have you. It just works.

## Usage

```bash
$ aneth start <hostname> [-s|--service <serviceName>] [-w|--watch] [-p|--port port] [-A|--aliases aliases]
```

* You can provide a `serviceName` parameter that will be used to listen for advertisements. 
Otherwise, `aneth-hosts` will be used.

* The `--watch` options tells Aneth to watch for advertised hosts on the network and modify
`/etc/hosts` accordingly (you'll need to execute that with `sudo` for it to work).

* The `--port` options is for specifying the port number to use to advertise the current machine.

* The `--aliases` options is set of local hostname aliases in the form of 

        --aliases from.some.domain:to.other.domain,another.one:to.another.one

```bash
$ aneth install <hostname> [--service <serviceName>] [--watch]
```

This will install Aneth so it is started on each system reboots, with the provided configurations. Currently, only Mac OS X is supported, simply using a [launchd.plist(5)][1]. I know it should work pretty easily on Linux too, but I'm no expert enough to provide a proper, portable solution. Currently, I'm simply creating a [dead-simple][3] [runit][2] setup. I'm kinda lazy, I know. You are very welcome to fork and submit a patch that would include generating and installing a generic init script (or anything really).

## Installation

You will need to install globally if you want the `aneth` executable accessible anywhere.

```bash
$ npm install -g aneth
```

On Mac, it will just work. On a linux machine, you need to install Avahi, a [Bonjour
compatibility library](https://github.com/agnat/node_mdns#installation).

Enjoy.

## License

http://wtfpl.org

[1]: http://developer.apple.com/library/mac/#documentation/Darwin/Reference/ManPages/man5/launchd.plist.5.html
[2]: http://smarden.org/runit/
[3]: https://gist.github.com/4652791
