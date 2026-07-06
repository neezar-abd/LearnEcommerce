import os, re
for root, _, files in os.walk('src/app/(store)'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            if '<Navbar' in content or '<Footer' in content:
                print(path)
                # Remove imports
                content = re.sub(r"import\s+Navbar\s+from\s+['\"].*?Navbar['\"]\s*;?\n", "", content)
                content = re.sub(r"import\s+Footer\s+from\s+['\"].*?Footer['\"]\s*;?\n", "", content)
                # Remove components
                content = re.sub(r"<Navbar[^>]*>\s*(</Navbar>)?", "", content)
                content = re.sub(r"<Footer[^>]*>\s*(</Footer>)?", "", content)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
