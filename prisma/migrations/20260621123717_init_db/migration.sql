-- CreateTable
CREATE TABLE "Kunde" (
    "id" SERIAL NOT NULL,
    "firma" TEXT,
    "ansprechpartner" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kunde_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kostenvoranschlag" (
    "id" SERIAL NOT NULL,
    "kvNummer" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENTWURF',
    "steuerSatzProzent" DOUBLE PRECISION NOT NULL DEFAULT 19.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kundeId" INTEGER NOT NULL,

    CONSTRAINT "Kostenvoranschlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "typ" TEXT NOT NULL,
    "bezeichnung" TEXT NOT NULL,
    "menge" DOUBLE PRECISION NOT NULL,
    "einheit" TEXT NOT NULL,
    "einzelpreisNetto" DOUBLE PRECISION NOT NULL,
    "kostenvoranschlagId" INTEGER NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kunde_email_key" ON "Kunde"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kostenvoranschlag_kvNummer_key" ON "Kostenvoranschlag"("kvNummer");

-- AddForeignKey
ALTER TABLE "Kostenvoranschlag" ADD CONSTRAINT "Kostenvoranschlag_kundeId_fkey" FOREIGN KEY ("kundeId") REFERENCES "Kunde"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_kostenvoranschlagId_fkey" FOREIGN KEY ("kostenvoranschlagId") REFERENCES "Kostenvoranschlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
