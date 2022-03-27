
# Intro

This project started with the idea to improve the well known Gaggia Classic. Inspired by [Decent Espresso](https://decentespresso.com) and other Arduino coffee projects I tried to develop my version of a "Decent" Gaggia Classic with an Arduino board. The initial prototype has a PID using an Arduino. Further development shall lead to pressure profiling and saving multiple shot profiles.
# Live demo



## Pulling a shot
https://user-images.githubusercontent.com/44913260/160293038-132dfd3f-46b5-47e0-9442-545ab9c723f5.mov

# Features
- [x] HMI using a modern frontend framework ( React )
- [x] PID using an arduino
- [x] Over the air updates
- [x] Switching between brew mode and steam mode
- [ ] Powering the Arduino from the Gaggia
- [ ] Editing setpoints via interface
- [ ] Pressure profiling
- [ ] Weighing shots
- [ ] Saving shot profiles

# Bill of materials
 First of all you should check which [Gaggia](https://clevercoffee.de/gaggia-classic-9403-pid-only/) machine you have. All principles can be applied to other manufacturers.

## Base components
- [ESP32](https://de.aliexpress.com/item/1005002410521023.html?spm=a2g0o.productlist.0.0.143d745aGmcwLI&algo_pvid=294d5305-bb05-42d3-a587-069c5c8609f6&aem_p4p_detail=202203141218331972711337181670031915877&algo_exp_id=294d5305-bb05-42d3-a587-069c5c8609f6-4&pdp_ext_f=%7B%22sku_id%22%3A%2212000020563171209%22%7D&pdp_pi=-1%3B3.72%3B-1%3B1.16%40salePrice%3BEUR%3Bsearch-mainSearch)

## PID components
- [MAX6675 thermocouple](https://de.aliexpress.com/item/32860265425.html?spm=a2g0o.productlist.0.0.3c52733cTT2GjZ&algo_pvid=17b1e326-90ec-49c9-a830-8af828e13dd6&algo_exp_id=17b1e326-90ec-49c9-a830-8af828e13dd6-3&pdp_ext_f=%7B%22sku_id%22%3A%2265580676538%22%7D&pdp_pi=-1%3B2.46%3B-1%3B-1%40salePrice%3BEUR%3Bsearch-mainSearch) board for reading temperature values from a temp sensor
- [K Typ temperature sensor for Gaggia 9403](https://de.aliexpress.com/item/32835036293.html?gatewayAdapt=glo2deu&spm=a2g0s.9042311.0.0.27424c4diT6T0k)
- [K Typ temperature sensor C-M4 screw for Gaggia 9303](https://de.aliexpress.com/item/32835036293.html?gatewayAdapt=glo2deu&spm=a2g0s.9042311.0.0.27424c4diT6T0k)
- [SSR 40DA Relay](https://de.aliexpress.com/item/4000899938277.html?spm=a2g0o.productlist.0.0.6abc4714c20hTA&algo_pvid=b4257e89-0111-4b18-91fa-7f3ecc7dff75&algo_exp_id=b4257e89-0111-4b18-91fa-7f3ecc7dff75-1&pdp_ext_f=%7B%22sku_id%22%3A%2212000025206149674%22%7D&pdp_pi=-1%3B3.9%3B-1%3B-1%40salePrice%3BEUR%3Bsearch-mainSearch) for switching the boiler on/off

# Tech stack

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [Awot](https://awot.net/en/guide/tutorial.html)


