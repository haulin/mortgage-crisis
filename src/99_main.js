function TIC() {
  if (PD.mainTick) PD.mainTick();
  else PD.bootTick();
}

