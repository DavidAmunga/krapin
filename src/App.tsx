import { useEffect, useState } from "react";
import "./App.css";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import QRCode from "react-qr-code";
import {
  PlusIcon,
  CopyIcon,
  Share1Icon,
  EnvelopeClosedIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { ScrollArea } from "./components/ui/scroll-area";
import { PIN } from "./types/pin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";
import { ModeToggle } from "./components/mode-toggle";

const PIN_STORAGE_KEY = "krapins";

const formatPIN = (pin: string) => {
  const cleanPin = pin.replace(/\s/g, "");

  if (cleanPin.length >= 10) {
    return `${cleanPin.slice(0, 3)} ${cleanPin.slice(3, 7)} ${cleanPin.slice(
      7
    )}`;
  }
  return cleanPin;
};

function App() {
  const [pins, setPins] = useState<PIN[]>([]);
  const [selectedPin, setSelectedPin] = useState<PIN | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", pin: "" });
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    const storedPins = localStorage.getItem(PIN_STORAGE_KEY);
    if (storedPins) {
      setPins(JSON.parse(storedPins));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPin = formatPIN(formData.pin);

    if (selectedPin) {
      const updatedPins = pins.map((p) =>
        p.id === selectedPin.id
          ? {
              ...p,
              name: formData.name,
              pin: formattedPin,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      setPins(updatedPins);
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(updatedPins));
    } else {
      const newPin = {
        id: crypto.randomUUID(),
        name: formData.name,
        pin: formattedPin,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newPins = [...pins, newPin];
      setPins(newPins);
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(newPins));
    }
    setIsOpen(false);
    setSelectedPin(null);
    setFormData({ name: "", pin: "" });
  };

  const handlePinClick = (pin: PIN) => {
    setSelectedPin(pin);
    setFormData({ name: pin.name, pin: pin.pin });
    setIsOpen(true);
  };

  const handleAddNew = () => {
    setSelectedPin(null);
    setFormData({ name: "", pin: "" });
    setIsOpen(true);
  };

  const handleCopyToClipboard = (pin: PIN) => {
    const text = `Name: ${pin.name}\nPIN: ${pin.pin}`;
    navigator.clipboard.writeText(text);
  };

  const handleWhatsAppShare = (pin: PIN) => {
    const text = encodeURIComponent(`Name: ${pin.name}\nPIN: ${pin.pin}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleEmailShare = (pin: PIN) => {
    const subject = encodeURIComponent(`KRA PIN Details - ${pin.name}`);
    const body = encodeURIComponent(`Name: ${pin.name}\nPIN: ${pin.pin}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleDelete = (pinId: string) => {
    const updatedPins = pins.filter((p) => p.id !== pinId);
    setPins(updatedPins);
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(updatedPins));
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="KRA PIN Logo" className="h-8 w-auto" />
              <h1 className="text-3xl font-bold">KRA PIN Manager</h1>
            </div>
            <p className="text-muted-foreground">
              Store all your KRA PINs securely offline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button onClick={handleAddNew}>
                  <PlusIcon className="mr-2 h-4 w-4" /> Add PIN
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={isMobile ? "max-h-[70vh] overflow-hidden" : ""}
              >
                <SheetHeader>
                  <SheetTitle>
                    {selectedPin ? "View/Edit PIN" : "Add New PIN"}
                  </SheetTitle>
                </SheetHeader>
                {selectedPin ? (
                  <Tabs defaultValue="view" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="view">View</TabsTrigger>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                    </TabsList>
                    <TabsContent value="view" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <Label>{selectedPin.name}</Label>
                          <p className="text-lg font-medium">
                            {selectedPin.pin}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Date Created</Label>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedPin.createdAt).toDateString()}
                            </p>
                          </div>
                          <div>
                            <Label>Last Updated</Label>
                            <p className="text-sm text-muted-foreground">
                              {new Date(selectedPin.updatedAt).toDateString()}
                            </p>
                          </div>
                        </div>
                        {isMobile ? (
                          <ScrollArea className="h-[calc(70vh-350px)]">
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  handleCopyToClipboard(selectedPin)
                                }
                              >
                                <CopyIcon className="mr-2 h-4 w-4" />
                                Copy to Clipboard
                              </Button>

                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleWhatsAppShare(selectedPin)}
                              >
                                <Share1Icon className="mr-2 h-4 w-4" />
                                Share via WhatsApp
                              </Button>

                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEmailShare(selectedPin)}
                              >
                                <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                                Share via Email
                              </Button>
                              <div className="mt-2 p-4 bg-white rounded-lg flex items-center justify-center ">
                                <QRCode value={selectedPin.pin} size={200} />
                              </div>
                              <div className="flex flex-col gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      className="w-full"
                                    >
                                      <TrashIcon className="mr-2 h-4 w-4" />
                                      Delete PIN
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the PIN for{" "}
                                        {selectedPin.name}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(selectedPin.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </ScrollArea>
                        ) : (
                          <>
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  handleCopyToClipboard(selectedPin)
                                }
                              >
                                <CopyIcon className="mr-2 h-4 w-4" />
                                Copy to Clipboard
                              </Button>

                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleWhatsAppShare(selectedPin)}
                              >
                                <Share1Icon className="mr-2 h-4 w-4" />
                                Share via WhatsApp
                              </Button>

                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleEmailShare(selectedPin)}
                              >
                                <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                                Share via Email
                              </Button>
                            </div>
                            <div className="mt-3">
                              <div className="mt-2 p-4 bg-white rounded-lg flex justify-center items-center ">
                                <QRCode value={selectedPin.pin} size={200} />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    className="w-full"
                                  >
                                    <TrashIcon className="mr-2 h-4 w-4" />
                                    Delete PIN
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the PIN for{" "}
                                      {selectedPin.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDelete(selectedPin.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="edit">
                      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pin">PIN</Label>
                          <Input
                            id="pin"
                            value={formData.pin}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, "");
                              setFormData({
                                ...formData,
                                pin: formatPIN(value),
                              });
                            }}
                            placeholder="123 4567 890"
                            maxLength={11}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Update PIN
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 pr-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pin">PIN</Label>
                      <Input
                        id="pin"
                        value={formData.pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          setFormData({ ...formData, pin: formatPIN(value) });
                        }}
                        placeholder="123 4567 890"
                        maxLength={11}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add PIN
                    </Button>
                  </form>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {pins.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No PINs Added Yet</h2>
            <p className="text-muted-foreground mb-4">
              Click the Add PIN button to store your first KRA PIN
            </p>
            <Button onClick={handleAddNew}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add PIN
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pins.map((pin) => (
              <div
                key={pin.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handlePinClick(pin)}
                  >
                    <h3 className="font-medium mb-2">{pin.name}</h3>
                    <p className="text-muted-foreground">{pin.pin}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Created: {new Date(pin.createdAt).toDateString()}</p>
                      <p>
                        Last edited: {new Date(pin.updatedAt).toDateString()}
                      </p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the PIN for {pin.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(pin.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
