import json, os
p = r'c:\Teste\Catalogo\apps\web\package.json'
data = json.load(open(p, encoding='utf-8'))
deps = data.get('dependencies', {})
if '@radix-ui/react-textarea' in deps:
    del deps['@radix-ui/react-textarea']
    print('Removido @radix-ui/react-textarea')
json.dump(data, open(p, 'w', encoding='utf-8', newline='\n'), indent=2)
print('package.json atualizado')
