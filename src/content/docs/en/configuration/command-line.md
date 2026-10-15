---
title: "Command line"
description: "Run any action of the admin panel from the server over SSH with catena-panel: list the actions, pass arguments, confirm, read JSON, give secrets on standard input, and find the run in the audit log."
---

Every action the [admin dashboard](/en/features/admin-dashboard/) offers can also run from the server's command line. The command line runs the same action as the panel button: same checks (your subscription, the action's arguments, the confirmation) and the same audit record.

You run it as root, over SSH, with `catena-panel`. Sign in as `ops` (see [SSH to the server as ops](/en/configuration/admin-access/#ssh-to-the-server-as-ops)) and put `sudo` in front:

```bash
sudo catena-panel <command> [--<argument>=<value> ...]
```

`catena-panel` runs the action inside the running panel. If the panel is not running, it stops with exit status 2 and the message "no task of the catena-admin service runs on this server". Run `docker service ps catena-admin` to see why. Run `sudo catena-panel` with no command to print the usage.

## List the actions

```bash
sudo catena-panel --list
```

Each line is an action. The mark `(job)` shows an action that runs for a while and streams its output. The mark `(read-only)` shows an action that changes nothing. Under each action, one line per argument gives its name and its kind (`text`, `secret`, `bool`, `int`, `enum`, `list` or `file`), then `required`, the choices of an `enum` (`one of a|b`) or the most a `list` takes (`at most 5`). The list shows only the actions your subscription unlocks.

## Pass arguments

Write each argument as `--<name>=<value>`:

```bash
sudo catena-panel <command> --name=value
```

- Repeat a `list` argument once for each value: `--app=one --app=two`.
- A `bool` argument written alone, such as `--confirm`, means yes.
- An argument that is not in the list, or a value of the wrong kind, is refused and nothing runs. The message names the argument, never its value.

## Confirm an action

An action that asks you to confirm, like the panel's confirmation box, lists `confirm: bool, required` among its arguments. Without the argument it is refused ("the command runs only once confirmed") and nothing runs. Add `--confirm` to run it:

```bash
sudo catena-panel <command> --confirm
```

## Give a secret or a file

A secret never goes in an argument: the server's process list would show it, and the command refuses `--<name>=<value>` for a secret argument. Write the arguments as one JSON object in a file only you can read, and give the file on standard input with `--args-stdin`:

```bash
sudo catena-panel <command> --args-stdin < arguments.json
```

The object holds the arguments by name, each a string, a number, `true` or `false`, or a list of those:

```json
{"password": "the secret", "app": ["one", "two"]}
```

Delete the file once the action has run.

An argument of the kind `file` takes the file on standard input with `--file-stdin`. The file keeps the name of the argument unless you give another: `--file-stdin=backup.tar`.

```bash
sudo catena-panel <command> --file-stdin < the-file
```

`--args-stdin` and `--file-stdin` cannot be used together, because standard input carries only one of them. Pass the other arguments as flags.

When an action hands a secret back, such as a new password, the command prints it once among the result lines. The audit log and the running action never keep it.

## Read the result

An action that answers at once prints one `key: value` line each for its code, its detail and its data, and exits with status 0 when it succeeded and 1 when it did not. An action that is not in your list (unknown, or locked by your subscription) exits with status 1. A mistake in the command itself, such as an unknown flag, exits with status 2 and prints the usage.

Add `--json` to print the same result, or the list, as JSON. A result has `code`, `ok`, `detail`, `data`, `secret` and `rc`.

```bash
sudo catena-panel <command> --json
```

## Long actions

An action marked `(job)` starts at once and prints its output as it arrives, errors on standard error. The command exits with the status the action ends with. Status 2 also means the command could not reach the panel or read its answer. With `--json`, the command prints nothing until the action ends, then one object holding `job`, `lines` and `result`.

The action runs inside the panel, whether or not anyone watches its output. If your SSH session drops, the action keeps running and the audit log records its end. The command line cannot reattach: output printed after the drop is lost to your terminal. To keep the output of a long action when your connection is unstable, start it in `tmux` or `screen`.

## The audit log

An action that changes the server leaves one record in the audit log, like a click in the panel. The record names the action, the person, the address and the exit status, and carries the channel it came through: `cli` for the command line, `panel` for the browser. Read-only actions leave no record. The **Audit log** panel (Catena Business) shows the records; see [People and audit trail](/en/features/single-sign-on/#people-and-audit-trail).

The record carries your server's admin email. To record another person, add `--as`:

```bash
sudo catena-panel <command> --as=someone@yourdomain.com
```

`--as` names the person in the record; it does not check who you are. Anyone who can run `sudo catena-panel` is already root on the server.

## Related

- [Admin dashboard](/en/features/admin-dashboard/)
- [Admin access and tailnet](/en/configuration/admin-access/)
- [Server settings](/en/configuration/server/)
