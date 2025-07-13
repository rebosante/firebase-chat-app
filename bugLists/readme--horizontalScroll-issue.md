# Horizontal Scroll issue on website

This visual bug is common when applying too many ```width: 100vw``` CSS styles on container DIVs. It is best practice to minimize the amount of overwrites for each container by making the root elements view width 100 and let the cascading styles in the children do the padding and margins. 

Tested on a 1920x1080 screen resolution on desktop with Google Chrome.

## Problem
![Hedlyner-Venues-03-31-2025_10_21_AM.jpg](img/Hedlyner-Venues-03-31-2025_10_21_AM.jpg)

![Screenshot 2025-03-31 104101.png](img/Screenshot%202025-03-31%20104101.png)
![Screenshot 2025-03-31 104314.png](img/Screenshot%202025-03-31%20104314.png)

## Solution
Since we have div containers overflowing the screen-size - header and footer - with over 1920px versus 1905px we need to remove some styles affecting the width of the element. The position fixed and relative will keep the divs behaving quite similar across devices.

### Change Header styles
#### From
```
.vue-header-container[data-v-0d8aa066] {
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 120;
}
```
#### to
```
.vue-header-container[data-v-0d8aa066] {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 120;
}
```

### Change Footer styles
#### From
```
.vue-footer-container[data-v-bb151cd8] {
    background: #262626;
    display: flex;
    flex-direction: column;
    gap: 88px;
    min-height: 285px;
    padding: 30px 90px 25px;
    position: relative;
    width: 100vw;
    z-index: 119;
}
```
#### to
```
.vue-footer-container[data-v-bb151cd8] {
    background: #262626;
    display: flex;
    flex-direction: column;
    gap: 88px;
    min-height: 285px;
    padding: 30px 90px 25px;
    position: relative;
    width: 100%;
    z-index: 119;
}
```