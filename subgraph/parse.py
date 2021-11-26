import yaml
import re
import os
from dotenv import load_dotenv

load_dotenv()

path_matcher = re.compile(r'\$\{([^}^{]+)\}')
def path_constructor(loader, node):

    ''' Extract the matched value, expand env variable, and replace the match '''
    print("i'm here")
    value = node.value
    match = path_matcher.match(value)
    env_var = match.group()[2:-1]
    return os.getenv(env_var) + value[match.end():]

yaml.add_implicit_resolver('!path', path_matcher, None, yaml.SafeLoader)
yaml.add_constructor('!path', path_constructor, yaml.SafeLoader)


if __name__ == '__main__':
    with open('subgraph-base.yaml', 'r') as file:
        test_yaml = yaml.safe_load(file)
        #print(os.getenv('hello')) ## you better work
        #print(test_yaml['hello']) ## you better work/file.txt
    
        with open('subgraph.yaml', 'w') as file:
            yaml.dump(test_yaml, file)

        print(open('subgraph.yaml').read())
