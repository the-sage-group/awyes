import re
import json
import types
import textwrap
import collections

from .utils import rgetattr, rsetattr, Colors


class Deployment:
    MATCH_REF = "reference"
    CACHE_REGEX = "\$\((?P<reference>.*?)\)"

    def __init__(self, verbose, preview, config, clients):
        self.cache = (nested_dict := lambda: collections.defaultdict(nested_dict))()

        self.config = config
        self.clients = clients

        self.verbose = verbose
        self.preview = preview

    def run(self, actions):
        if self.preview:
            self.summarize(actions)
            return

        for action in actions:
            self.execute(action)

    def resolve(self, args):
        return json.loads(
            re.sub(
                Deployment.CACHE_REGEX,
                lambda m: rgetattr(self.cache, m.group(Deployment.MATCH_REF)),
                json.dumps(args, sort_keys=True),
            )
        )

    # e.g. <namespace>.<client>.<fn>.<optional meta tag>
    def execute(self, action):
        name, client_name, fn_name = action.split(".")
        id = f"{name}.{client_name}.{fn_name}"

        if self.verbose:
            print(f"{Colors.OKCYAN}{id}{Colors.ENDC}")

        try:
            fn = rgetattr(
                self.clients,
                fn_name if client_name == "user" else f"{client_name}.{fn_name}",
            )
            args = self.resolve(self.config[action])

            if self.verbose:
                self.print_status(args, Colors.OKBLUE, "→")

            if isinstance(args, dict):
                value = fn(**args)
            elif isinstance(args, list):
                value = fn(*args)
            elif args:
                value = fn(args)
            else:
                value = fn()

            # Auto-unpack generator results
            if isinstance(value, types.GeneratorType):
                value = list(value)

            if self.verbose:
                self.print_status(value, Colors.OKGREEN, "✓")

            rsetattr(self.cache, id, value)

        except Exception as e:
            self.print_status(e, Colors.FAIL, "✗")

    def summarize(self, actions):
        for action in actions:
            print(f"{Colors.OKCYAN}{action}{Colors.ENDC}")
            self.print_status(self.config[action], Colors.OKBLUE, "→")

        print()

    def print_status(self, value, status, indicator):
        print(
            textwrap.indent(
                json.dumps(value, indent=2, default=str),
                f"{status}{indicator} {Colors.ENDC}",
                lambda _: True,
            )
        )
