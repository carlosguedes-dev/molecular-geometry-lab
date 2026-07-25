<div align="center">

# 🧪 Molecular Geometry Lab (Laboratório 3D de Geometria Molecular) ⚛️✨

**Uma plataforma web interativa, imersiva e de alta precisão 3D para o estudo avançado das estruturas fundamentais da geometria molecular!**

[![Versão](https://img.shields.io/badge/versão-1.0.0-00d2ff?style=for-the-badge&logo=atom&logoColor=white)](https://github.com)
[![Licença](https://img.shields.io/badge/licença-MIT-00ff88?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Feito com Amor](https://img.shields.io/badge/Feito_com-MUITO_AMOR_❤️-ff0055?style=for-the-badge)](https://github.com)

---

🔗 **[Acessar o Projeto Ao Vivo / Demonstração Online](https://carlosguedes-dev.github.io/molecular-geometry-lab/)**

<p align="center">
  <img src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop" alt="Banner Geometria Molecular 3D" width="80%" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 210, 255, 0.4);">
</p>

</div>

---

## 📖 Sobre o Projeto

O **Molecular Geometry Lab** é uma aplicação web interativa de ponta (*Ultra-Premium 3D Experience & Luxury Dark Mode*) desenvolvida para revolucionar o aprendizado e a visualização de estruturas moleculares. Combinando rigor científico e um design moderno com tecnologia **Three.js**, a plataforma transforma conceitos abstratos de química valencial em modelos espaciais táteis e visualmente impressionantes.

O projeto foi construído em torno da renomada **Teoria de Repulsão dos Pares de Elétrons da Camada de Valência (VSEPR)**, proporcionando um ambiente de estudo imersivo para explorar as **5 geometrias fundamentais**: Linear, Trigonal Planar, Tetraédrica, Pirâmide Trigonal e Angular. Com rotação livre em 360°, controle imersivo de zoom e renderização de iluminação em tempo real, o usuário pode inspecionar os detalhes mais sutis das ligações químicas.

Além da exploração passiva, o laboratório capacita estudantes, professores e entusiastas da ciência através da experimentação ativa. A interface apresenta modos deduzidos para análise de nuvens eletrônicas e pares isolados de elétrons, bem como um construtor molecular dinâmico, estabelecendo uma ponte intuitiva e inesquecível entre a teoria acadêmica e a visualização gráfica de precisão.

---

## ✨ Principais Funcionalidades

- 🔬 **Modo Explorar 3D Interativo**: Navegação orbital de alta precisão por 15 moléculas reais preconfiguradas. Rotacione livremente o viewport em qualquer ângulo e aproxime ou afaste a visualização via zoom dinâmico.
- 🛠️ **Modo Construir em Tempo Real**: Monte suas próprias estruturas moleculares do zero! Escolha a geometria e adicione átomos ligantes ao núcleo central, acompanhando a redefinição espacial do modelo instantaneamente.
- ⚡ **Análise Visual & Nuvens Eletrônicas**: Camadas de sobreposição (*overlays*) didáticas que permitem visualizar representações de nuvens eletrônicas, pares de elétrons não-ligantes (isolados) e anotações de ângulos de ligação.
- 💎 **Aestética Glassmorphism Luxury**: Interface desenvolvida com efeitos de vidro fosco (`backdrop-filter: blur`), tipografia moderna, transições suaves e uma tela de carregamento cinematográfica em paleta Dark Mode.
- 📐 **Fidelidade à Teoria VSEPR**: Modelagem estrutural programada para respeitar fielmente a repulsão eletrônica, facilitando a compreensão intuitiva da geometria espacial química.
- 📱 **Totalmente Responsivo & Otimizado**: Controles touch adaptados para tablets e smartphones, garantindo performance fluida a 60 FPS em qualquer tela.

---

## 💻 Tecnologias Utilizadas

Este projeto foi desenvolvido com uma arquitetura focada em máximo desempenho gráfico, modularidade e zero dependências de frameworks de UI pesados:

- **HTML5 Semântico**: Estruturação acessível, limpa e otimizada para navegadores modernos e motores de busca.
- **CSS3 Moderno**: Sistema avançado de variáveis (Design Tokens), Flexbox, CSS Grid, Glassmorphism (`backdrop-filter`), animações `@keyframes` e media queries para responsividade total.
- **JavaScript (Vanilla ES6+)**: Arquitetura modular robusta baseada em classes e eventos para controle de estado, manipulação de DOM e lógica computacional do construtor molecular.
- **Three.js & WebGL**: Motor gráfico 3D de alta performance responsável pela renderização de malhas esféricas (átomos), cilindros de ligação, iluminação condicional e controle de câmera orbital (*OrbitControls*).

---

## 📁 Estrutura de Arquivos

```text
molecular-geometry-lab/
│
├── index.html              # Estrutura principal da aplicação web 3D
├── README.md               # Documentação completa do projeto (este arquivo)
├── CONTRIBUTING.md         # Guia e diretrizes para contribuições da comunidade
├── LICENSE                 # Licença MIT de código aberto
├── css/
│   └── styles.css          # Sistema de design, Glassmorphism, animações e responsividade
└── js/
    ├── main.js             # Ponto de entrada, inicialização de módulos e listeners de eventos
    ├── moleculeData.js     # Banco de dados com parâmetros estruturais das 15 moléculas
    ├── sceneManager.js     # Gerenciamento da cena 3D, luzes, câmera e renderização Three.js
    ├── moleculeBuilder.js  # Lógica de montagem geométrica e renderização de esferas/ligações
    ├── customBuilder.js    # Módulo interativo para criação de moléculas personalizadas
    └── uiController.js     # Controle de interface, overlays, tooltips e transições de tela
```

---

## 🚀 Como Executar o Projeto

Você pode rodar e testar o laboratório diretamente em seu ambiente local sem necessidade de configurações complexas:

1. **Opção 1: Execução Rápida via Navegador**
   - Faça o clone ou download deste repositório em sua máquina:
     ```bash
     git clone https://github.com/carlosguedes-dev/molecular-geometry-lab.git
     ```
   - Navegue até a pasta do projeto e dê um **duplo clique** no arquivo `index.html` para abri-lo diretamente em seu navegador (Chrome, Edge, Firefox ou Safari).

2. **Opção 2: Com Visual Studio Code & Live Server (Recomendado)**
   - Abra a pasta do projeto no [Visual Studio Code](https://code.visualstudio.com/).
   - Certifique-se de ter a extensão **Live Server** instalada.
   - Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**. O laboratório será aberto em `http://127.0.0.1:5500` com recarregamento em tempo real.

3. **Opção 3: Deploy Online via GitHub Pages**
   - Este projeto está estruturado para publicação instantânea e gratuita através do **GitHub Pages**. Basta enviar o código para um repositório no GitHub, acessar as configurações de `Pages` e ativar a publicação pela branch principal!

---

## 🤝 Como Contribuir

Contribuições são extremamente bem-vindas para enriquecer ainda mais este laboratório educacional! Se você deseja adicionar novas moléculas, aprimorar shaders 3D ou traduzir a interface, confira nosso guia detalhado em [CONTRIBUTING.md](CONTRIBUTING.md) para saber como participar do desenvolvimento.

---

## 📄 Licença

Este projeto está devidamente protegido e distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações sobre direitos de uso, modificação e distribuição.

---

<div align="center">
  <p>Feito com todo o carinho, dedicação e engenharia de precisão por <a href="https://github.com/carlosguedes-dev"><b>Carlos Guedes</b></a> ❤️</p>
  <p><b>Transformando ciência e código em experiências digitais inesquecíveis! 🚀✨</b></p>
</div>
